using System.Security.Cryptography;
using System.Text;
using System.Web;
using BookStoresApi.Data;
using BookStoresApi.DTOs;
using BookStoresApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BookStoresApi.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly VNPayConfig _vnPayConfig;
        private readonly ILogger<PaymentService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PaymentService(
            ApplicationDbContext context,
            IOptions<VNPayConfig> vnPayConfig,
            ILogger<PaymentService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _vnPayConfig = vnPayConfig.Value;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PaymentResponse> CreatePayment(PaymentRequest request)
        {
            // Tìm order
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == request.OrderId);

            if (order == null)
            {
                throw new Exception("Order not found");
            }

            // Sử dụng PaymentTxnRef từ order (đã được tạo sẵn khi tạo order)
            string vnpTxnRef = order.PaymentTxnRef ?? Guid.NewGuid().ToString("N").Substring(0, 20);
            
            DateTime now = DateTime.Now;
            DateTime expire = now.AddMinutes(15);
            string dateFormat = "yyyyMMddHHmmss";

            // Build vnpParams (SortedDictionary = TreeMap trong Java)
            var vnpParams = new SortedDictionary<string, string>
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", _vnPayConfig.TmnCode },
                { "vnp_Amount", ((long)Math.Round(order.TotalAmount * 100)).ToString() }, // Làm tròn
                { "vnp_CurrCode", "VND" },
                { "vnp_TxnRef", vnpTxnRef }, // Sử dụng PaymentTxnRef từ order
                { "vnp_OrderInfo", $"Thanh toan don hang #{order.OrderId}" },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", request.ReturnUrl },
                { "vnp_IpAddr", GetIpAddress() },
                { "vnp_Locale", "vn" },
                { "vnp_CreateDate", now.ToString(dateFormat) },
                { "vnp_ExpireDate", expire.ToString(dateFormat) }
            };

            // Build queryUrl và signData theo chuẩn VNPay
            var queryUrl = new StringBuilder();
            var signData = new StringBuilder();

            foreach (var kvp in vnpParams)
            {
                if (!string.IsNullOrEmpty(kvp.Value))
                {
                    // Encode value with UPPERCASE hex như Java (US_ASCII)
                    string encodedValue = UrlEncodeUpperCase(kvp.Value);
                    
                    // SignData: key=encodedValue& 
                    signData.Append(kvp.Key).Append('=').Append(encodedValue).Append('&');
                    
                    // QueryUrl: key=encodedValue& (key KHÔNG encode, chỉ value)
                    queryUrl.Append(kvp.Key)
                        .Append('=')
                        .Append(encodedValue)
                        .Append('&');
                }
            }

            // Remove last '&' from signData
            if (signData.Length > 0)
            {
                signData.Length--;
            }
            
            // QueryString keeps the '&' for now
            string queryString = queryUrl.ToString();

            // Create secure hash from RAW signData
            string secureHash = HmacSHA512(_vnPayConfig.HashSecret, signData.ToString());
            
            // Final URL
            string paymentUrl = _vnPayConfig.PayUrl + "?" + queryString + "vnp_SecureHash=" + secureHash;

            return new PaymentResponse
            {
                PaymentUrl = paymentUrl
            };
        }

        public async Task<object> HandleVnpayReturn(HttpRequest request)
        {
            string? queryString = request.QueryString.Value;
            if (string.IsNullOrEmpty(queryString))
            {
                return new { success = false, message = "No query provided" };
            }

            // Remove leading '?'
            queryString = queryString.TrimStart('?');

            // Parse query string thành SortedDictionary (giống TreeMap)
            var inputData = new SortedDictionary<string, string>();
            
            foreach (var param in queryString.Split('&'))
            {
                var parts = param.Split('=', 2);
                string key = parts[0];
                string value = parts.Length > 1 ? parts[1] : "";

                // Exclude vnp_SecureHash và vnp_SecureHashType
                if (key != "vnp_SecureHash" && key != "vnp_SecureHashType")
                {
                    inputData[key] = value;
                }
            }

            // Build hashData để validate
            var hashData = new StringBuilder();
            foreach (var kvp in inputData)
            {
                hashData.Append(kvp.Key).Append('=').Append(kvp.Value).Append('&');
            }
            hashData.Length--; // Remove last '&'

            // Compute secure hash
            string secureHash = HmacSHA512(_vnPayConfig.HashSecret, hashData.ToString());
            string receivedHash = request.Query["vnp_SecureHash"].ToString();

            // Validate signature
            if (!secureHash.Equals(receivedHash, StringComparison.OrdinalIgnoreCase))
            {
                return new { success = false, message = "Invalid signature" };
            }

            // Get payment info từ callback
            string vnpTxnRef = request.Query["vnp_TxnRef"].ToString();
            string vnpResponseCode = request.Query["vnp_ResponseCode"].ToString();
            string vnpTransactionNo = request.Query["vnp_TransactionNo"].ToString();
            string bankCode = request.Query["vnp_BankCode"].ToString();
            string vnpPayDate = request.Query["vnp_PayDate"].ToString();

            // Find order by PaymentTxnRef
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.PaymentTxnRef == vnpTxnRef);
            
            if (order == null)
            {
                return new { success = false, message = $"Order not found with PaymentTxnRef: {vnpTxnRef}" };
            }

            // Kiểm tra xem order đã được xử lý chưa
            if (order.OrderStatus == "Processing" || order.OrderStatus == "Completed")
            {
                // Trả về kết quả từ DB (đã xử lý trước đó)
                return new 
                { 
                    success = true,
                    message = "Payment already processed",
                    orderId = order.OrderId,
                    orderCode = order.OrderCode,
                    status = order.OrderStatus,
                    alreadyProcessed = true
                };
            }

            // Xác thực với VNPay Query API
            var queryResult = await QueryTransaction(vnpTxnRef, vnpPayDate);
            
            _logger.LogInformation("=== VNPay Query Result ===");
            _logger.LogInformation("OrderId: {OrderId}, TxnRef: {TxnRef}", order.OrderId, vnpTxnRef);
            _logger.LogInformation("ResponseCode: {ResponseCode}, TransactionStatus: {TransactionStatus}", 
                queryResult.ResponseCode, queryResult.TransactionStatus);

            // Kiểm tra kết quả từ VNPay Query API
            if (vnpResponseCode == "00" && (queryResult.ResponseCode == "00" || queryResult.ResponseCode == "94"))
            {
                // Thanh toán thành công và VNPay xác nhận
                order.OrderStatus = "Processing";
                order.PaymentMethod = "VNPAY";
                await _context.SaveChangesAsync();

                return new
                {
                    success = true,
                    message = "Payment successful",
                    orderId = order.OrderId,
                    orderCode = order.OrderCode,
                    status = order.OrderStatus,
                    vnpayQuery = new
                    {
                        responseCode = queryResult.ResponseCode,
                        transactionStatus = queryResult.TransactionStatus,
                        transactionNo = queryResult.TransactionNo ?? vnpTransactionNo,
                        amount = queryResult.Amount,
                        bankCode = queryResult.BankCode ?? bankCode,
                        payDate = vnpPayDate,
                        message = queryResult.Message
                    }
                };
            }
            else
            {
                // Thanh toán thất bại hoặc xác thực thất bại
                order.OrderStatus = vnpResponseCode == "00" ? "Payment Verification Failed" : "Payment Failed";
                await _context.SaveChangesAsync();

                return new
                {
                    success = false,
                    message = vnpResponseCode == "00" 
                        ? "Payment verification failed with VNPay" 
                        : "Payment failed",
                    orderId = order.OrderId,
                    orderCode = order.OrderCode,
                    status = order.OrderStatus,
                    vnpayQuery = new
                    {
                        responseCode = queryResult.ResponseCode,
                        transactionStatus = queryResult.TransactionStatus,
                        message = queryResult.Message
                    },
                    callbackResponseCode = vnpResponseCode
                };
            }
        }

        private string HmacSHA512(string key, string data)
        {
            try
            {
                byte[] keyBytes = Encoding.UTF8.GetBytes(key);
                byte[] dataBytes = Encoding.UTF8.GetBytes(data);

                using (var hmac = new HMACSHA512(keyBytes))
                {
                    byte[] hashBytes = hmac.ComputeHash(dataBytes);
                    return BytesToHex(hashBytes);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to sign data", ex);
            }
        }

        private string BytesToHex(byte[] hash)
        {
            var result = new StringBuilder();
            foreach (byte b in hash)
            {
                result.Append(b.ToString("x2"));
            }
            return result.ToString();
        }

        // URL Encode với UPPERCASE hex giống Java (US_ASCII)
        // Khoảng trắng -> '+' (không phải %20)
        private string UrlEncodeUpperCase(string value)
        {
            if (string.IsNullOrEmpty(value))
                return string.Empty;

            var result = new StringBuilder();
            byte[] bytes = Encoding.GetEncoding("ISO-8859-1").GetBytes(value); // US_ASCII tương đương ISO-8859-1

            foreach (byte b in bytes)
            {
                char c = (char)b;
                // Khoảng trắng -> '+'
                if (c == ' ')
                {
                    result.Append('+');
                }
                // Các ký tự an toàn không cần encode
                else if ((c >= 'a' && c <= 'z') || 
                    (c >= 'A' && c <= 'Z') || 
                    (c >= '0' && c <= '9') ||
                    c == '-' || c == '_' || c == '.' || c == '~')
                {
                    result.Append(c);
                }
                else
                {
                    // Encode với UPPERCASE hex: %3A thay vì %3a
                    result.Append('%').Append(b.ToString("X2"));
                }
            }

            return result.ToString();
        }

        // Query transaction từ VNPay để xác thực thanh toán
        private async Task<VnPayQueryResponse> QueryTransaction(string txnRef, string transactionDate)
        {
            try
            {
                var requestId = Guid.NewGuid().ToString("N");
                var createDate = DateTime.Now.ToString("yyyyMMddHHmmss");
                var ipAddr = GetIpAddress();
                var orderInfo = $"Truy van giao dich {txnRef}";

                // Build query params
                var vnpParams = new SortedDictionary<string, string>
                {
                    { "vnp_RequestId", requestId },
                    { "vnp_Version", "2.1.0" },
                    { "vnp_Command", "querydr" },
                    { "vnp_TmnCode", _vnPayConfig.TmnCode },
                    { "vnp_TxnRef", txnRef },
                    { "vnp_OrderInfo", orderInfo },
                    { "vnp_TransactionDate", transactionDate },
                    { "vnp_CreateDate", createDate },
                    { "vnp_IpAddr", ipAddr }
                };

                // Tạo chuỗi signData theo định dạng VNPay QueryDR: sử dụng dấu | (pipe)
                // data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + 
                //        vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo
                var signData = string.Join("|", 
                    requestId,
                    "2.1.0",
                    "querydr",
                    _vnPayConfig.TmnCode,
                    txnRef,
                    transactionDate,
                    createDate,
                    ipAddr,
                    orderInfo
                );

                // Create secure hash
                string secureHash = HmacSHA512(_vnPayConfig.HashSecret, signData);
                vnpParams["vnp_SecureHash"] = secureHash;

                // Log để debug (TẠM THỜI)
                _logger.LogInformation("=== VNPay Query Request ===");
                _logger.LogInformation("SignData: {SignData}", signData);
                _logger.LogInformation("SecureHash: {SecureHash}", secureHash);

                // Call VNPay Query API
                using var httpClient = new HttpClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);
                
                var content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(vnpParams),
                    Encoding.UTF8,
                    "application/json");

                var response = await httpClient.PostAsync(_vnPayConfig.ApiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                _logger.LogInformation("VNPay Query Response Raw: {Response}", responseContent);

                // Deserialize với options để ignore case và missing properties
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
                };

                VnPayQueryResponse? queryResponse = null;
                try
                {
                    queryResponse = System.Text.Json.JsonSerializer.Deserialize<VnPayQueryResponse>(responseContent, options);
                }
                catch (System.Text.Json.JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "Failed to deserialize VNPay response: {Response}", responseContent);
                    return new VnPayQueryResponse 
                    { 
                        ResponseCode = "99", 
                        Message = $"JSON deserialization error: {jsonEx.Message}" 
                    };
                }

                return queryResponse ?? new VnPayQueryResponse { ResponseCode = "99", Message = "Empty response from VNPay" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling VNPay Query API");
                return new VnPayQueryResponse { ResponseCode = "99", Message = ex.Message };
            }
        }

        private string GetIpAddress()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return "127.0.0.1";
            }

            var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();

            // Handle loopback address for local testing
            if (ipAddress == "::1")
            {
                ipAddress = "127.0.0.1";
            }

            // Check for forwarded IP address from a proxy
            var forwardedHeader = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedHeader))
            {
                // Take the first IP in the list if multiple are present
                ipAddress = forwardedHeader.Split(',').FirstOrDefault()?.Trim();
            }
            
            return ipAddress ?? "127.0.0.1";
        }
    }
}
