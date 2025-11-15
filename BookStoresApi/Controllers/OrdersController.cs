using BookStoresApi.Data;
using BookStoresApi.DTOs;
using BookStoresApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public OrdersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/orders/new-code
        [HttpGet("new-code")]
        public async Task<IActionResult> GetNewOrderCode()
        {
            string newCode = "OR000001"; // default fallback

            var connStr = _configuration.GetConnectionString("DefaultConnection");
            using (var conn = new SqlConnection(connStr))
            {
                string query =
                    @"
                    SELECT ISNULL(
                        (
                            SELECT TOP 1
                                LEFT(order_code, PATINDEX('%[0-9]%', order_code) - 1) +
                                RIGHT('000000' + CAST(CAST(SUBSTRING(order_code, PATINDEX('%[0-9]%', order_code), LEN(order_code)) AS INT) + 1 AS VARCHAR), 6)
                            FROM Orders
                            WHERE
                                order_code LIKE '[A-Za-z]%' AND
                                PATINDEX('%[0-9]%', order_code) > 0 AND
                                ISNUMERIC(SUBSTRING(order_code, PATINDEX('%[0-9]%', order_code), LEN(order_code))) = 1
                            ORDER BY
                                CAST(SUBSTRING(order_code, PATINDEX('%[0-9]%', order_code), LEN(order_code)) AS INT) DESC
                        ),
                        'OR000001'
                    ) AS NewCode;
                ";

                using (var cmd = new SqlCommand(query, conn))
                {
                    await conn.OpenAsync();
                    var result = await cmd.ExecuteScalarAsync();
                    if (result != null && result != DBNull.Value)
                    {
                        newCode = result.ToString() ?? "OR000001";
                    }
                }
            }

            return Ok(new { orderCode = newCode });
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            // This endpoint returns ALL orders (for admin use)
            // For customer-specific orders, use GET /api/orders/my-orders
            
            return await _context
                .Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .OrderByDescending(o => o.OrderCode)
                .ToListAsync();
        }

        // GET: api/orders/my-orders (Get orders for current logged-in user)
        [HttpGet("my-orders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            // Debug: Log all claims
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
            }
            
            // Try to get userId from JWT token claims using different claim types
            var userIdClaim = User.FindFirst(ClaimTypes.Sid)?.Value 
                           ?? User.FindFirst("sid")?.Value
                           ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid")?.Value;
            
            Console.WriteLine($"UserIdClaim extracted: {userIdClaim}");
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated or userId not found in token" });
            }
            
            Console.WriteLine($"Filtering orders for userId: {userId}");
            
            // Return only user's orders
            var userOrders = await _context
                .Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .OrderByDescending(o => o.OrderCode)
                .ToListAsync();
                
            Console.WriteLine($"Found {userOrders.Count} orders for user {userId}");
            return userOrders;
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponse>> GetOrder(int id)
        {
            var order = await _context
                .Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound();
            }

            // Map to OrderResponse
            var response = new OrderResponse
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                PaymentMethod = order.PaymentMethod,
                ShippingFee = order.ShippingFee,
                UserId = order.UserId,
                User = order.User != null ? new UserInfo
                {
                    Id = order.User.Id,
                    FullName = order.User.FullName ?? string.Empty,
                    Email = order.User.Email,
                    PhoneNumber = order.User.PhoneNumber,
                    Address = order.User.Address
                } : null,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailResponse
                {
                    OrderDetailId = od.OrderDetailId,
                    ProductId = od.ProductId,
                    ProductName = od.Product?.ProductName ?? "Unknown",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Quantity * od.UnitPrice,
                    Product = od.Product != null ? new ProductInfo
                    {
                        ProductId = od.Product.ProductId,
                        ProductCode = od.Product.ProductCode,
                        ProductName = od.Product.ProductName,
                        Price = od.Product.Price,
                        MediaFiles = od.Product.MediaFiles?.Select(m => new MediaInfo
                        {
                            MediaId = m.MediaId,
                            MediaUrl = m.MediaUrl,
                            MediaType = m.MediaType
                        }).ToList() ?? new List<MediaInfo>()
                    } : null
                }).ToList()
            };

            return response;
        }

        // GET: api/orders/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(int customerId)
        {
            return await _context
                .Orders.Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .Where(o => o.UserId == customerId)
                .OrderByDescending(o => o.OrderCode)
                .ToListAsync();
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            // Auto-generate order code if not provided
            if (string.IsNullOrEmpty(order.OrderCode))
            {
                var codeResult = await GetNewOrderCode();
                var codeValue = (codeResult as OkObjectResult)?.Value;
                var codeProperty = codeValue?.GetType().GetProperty("orderCode");
                order.OrderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";
            }

            // Auto-generate payment transaction reference if not provided
            if (string.IsNullOrEmpty(order.PaymentTxnRef))
            {
                order.PaymentTxnRef = Guid.NewGuid().ToString("N").Substring(0, 20);
            }

            order.OrderDate = DateTime.Now;

            // Calculate total amount from order details
            if (order.OrderDetails != null && order.OrderDetails.Any())
            {
                order.TotalAmount =
                    order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice) + order.ShippingFee;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, order);
        }

        // POST: api/orders/create (Simplified version)
        [HttpPost("create")]
        public async Task<ActionResult<OrderResponse>> CreateOrderSimple(CreateOrderRequest request)
        {
            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Validate products and get prices
            var productIds = request.OrderDetails.Select(od => od.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                return BadRequest(new { message = "One or more products not found" });
            }

            // Generate order code
            var codeResult = await GetNewOrderCode();
            var codeValue = (codeResult as OkObjectResult)?.Value;
            var codeProperty = codeValue?.GetType().GetProperty("orderCode");
            string orderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";

            // Generate unique payment transaction reference (UUID 20 chars like Java)
            string paymentTxnRef = Guid.NewGuid().ToString("N").Substring(0, 20);

            // Determine initial order status based on payment method
            string initialStatus = "Pending";
            if (!string.IsNullOrEmpty(request.PaymentMethod) && 
                request.PaymentMethod.Equals("COD", StringComparison.OrdinalIgnoreCase))
            {
                initialStatus = "Confirmed"; // COD orders are confirmed immediately
            }

            // Create order
            var order = new Order
            {
                OrderCode = orderCode,
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                OrderStatus = initialStatus,
                PaymentMethod = request.PaymentMethod,
                ShippingFee = request.ShippingFee,
                PaymentTxnRef = paymentTxnRef,
                OrderDetails = new List<OrderDetail>()
            };

            // Create order details and calculate total
            decimal totalAmount = 0;
            foreach (var detailDto in request.OrderDetails)
            {
                var product = products.First(p => p.ProductId == detailDto.ProductId);
                var detail = new OrderDetail
                {
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitPrice = product.Price
                };

                totalAmount += detail.Quantity * detail.UnitPrice;
                order.OrderDetails.Add(detail);
            }

            order.TotalAmount = totalAmount + order.ShippingFee;

            // Save to database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            var createdOrder = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstAsync(o => o.OrderId == order.OrderId);

            // Map to response
            var response = new OrderResponse
            {
                OrderId = createdOrder.OrderId,
                OrderCode = createdOrder.OrderCode,
                OrderDate = createdOrder.OrderDate,
                TotalAmount = createdOrder.TotalAmount,
                OrderStatus = createdOrder.OrderStatus,
                PaymentMethod = createdOrder.PaymentMethod,
                ShippingFee = createdOrder.ShippingFee,
                UserId = createdOrder.UserId,
                OrderDetails = createdOrder.OrderDetails.Select(od => new OrderDetailResponse
                {
                    OrderDetailId = od.OrderDetailId,
                    ProductId = od.ProductId,
                    ProductName = od.Product?.ProductName ?? "Unknown",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Quantity * od.UnitPrice,
                    Product = od.Product != null ? new ProductInfo
                    {
                        ProductId = od.Product.ProductId,
                        ProductCode = od.Product.ProductCode,
                        ProductName = od.Product.ProductName,
                        Price = od.Product.Price,
                        MediaFiles = od.Product.MediaFiles?.Select(m => new MediaInfo
                        {
                            MediaId = m.MediaId,
                            MediaUrl = m.MediaUrl,
                            MediaType = m.MediaType
                        }).ToList() ?? new List<MediaInfo>()
                    } : null
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, response);
        }

        // POST: api/orders/admin-create (For admin to create order with custom status and date)
        [HttpPost("admin-create")]
        public async Task<ActionResult<OrderResponse>> AdminCreateOrder(AdminCreateOrderRequest request)
        {
            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Validate products exist
            var productIds = request.OrderDetails.Select(od => od.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                return BadRequest(new { message = "One or more products not found" });
            }

            // Generate order code
            var codeResult = await GetNewOrderCode();
            var codeValue = (codeResult as OkObjectResult)?.Value;
            var codeProperty = codeValue?.GetType().GetProperty("orderCode");
            string orderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";

            // Generate unique payment transaction reference if not provided
            string paymentTxnRef = request.PaymentTxnRef ?? Guid.NewGuid().ToString("N").Substring(0, 20);

            // Create order with admin-specified status and date
            var order = new Order
            {
                OrderCode = orderCode,
                UserId = request.UserId,
                OrderDate = request.OrderDate ?? DateTime.Now, // Use admin-specified date or current date
                OrderStatus = request.OrderStatus ?? "Pending",
                PaymentMethod = request.PaymentMethod,
                ShippingFee = request.ShippingFee,
                PaymentTxnRef = paymentTxnRef,
                OrderDetails = new List<OrderDetail>()
            };

            // Create order details with admin-specified unit prices
            decimal totalAmount = 0;
            foreach (var detailDto in request.OrderDetails)
            {
                var detail = new OrderDetail
                {
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitPrice = detailDto.UnitPrice // Use admin-specified unit price
                };

                totalAmount += detail.Quantity * detail.UnitPrice;
                order.OrderDetails.Add(detail);
            }

            order.TotalAmount = totalAmount + order.ShippingFee;

            // Save to database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            var createdOrder = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstAsync(o => o.OrderId == order.OrderId);

            // Map to response
            var response = new OrderResponse
            {
                OrderId = createdOrder.OrderId,
                OrderCode = createdOrder.OrderCode,
                OrderDate = createdOrder.OrderDate,
                TotalAmount = createdOrder.TotalAmount,
                OrderStatus = createdOrder.OrderStatus,
                PaymentMethod = createdOrder.PaymentMethod,
                ShippingFee = createdOrder.ShippingFee,
                UserId = createdOrder.UserId,
                OrderDetails = createdOrder.OrderDetails.Select(od => new OrderDetailResponse
                {
                    OrderDetailId = od.OrderDetailId,
                    ProductId = od.ProductId,
                    ProductName = od.Product?.ProductName ?? "Unknown",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Quantity * od.UnitPrice,
                    Product = od.Product != null ? new ProductInfo
                    {
                        ProductId = od.Product.ProductId,
                        ProductCode = od.Product.ProductCode,
                        ProductName = od.Product.ProductName,
                        Price = od.Product.Price,
                        MediaFiles = od.Product.MediaFiles?.Select(m => new MediaInfo
                        {
                            MediaId = m.MediaId,
                            MediaUrl = m.MediaUrl,
                            MediaType = m.MediaType
                        }).ToList() ?? new List<MediaInfo>()
                    } : null
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, response);
        }

        // PUT: api/orders/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Order order)
        {
            if (id != order.OrderId)
            {
                return BadRequest();
            }

            var existingOrder = await _context.Orders.FindAsync(id);
            if (existingOrder == null)
            {
                return NotFound();
            }

            existingOrder.OrderStatus = order.OrderStatus;
            existingOrder.PaymentMethod = order.PaymentMethod;
            existingOrder.ShippingFee = order.ShippingFee;
            existingOrder.TotalAmount = order.TotalAmount;
            existingOrder.UserId = order.UserId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // PUT: api/orders/{id}/full-update (For admin to update order with order details)
        [HttpPut("{id}/full-update")]
        public async Task<IActionResult> FullUpdateOrder(int id, FullUpdateOrderRequest request)
        {
            var existingOrder = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (existingOrder == null)
            {
                return NotFound();
            }

            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Validate products exist
            var productIds = request.OrderDetails.Select(od => od.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                return BadRequest(new { message = "One or more products not found" });
            }

            // Update order properties
            existingOrder.OrderStatus = request.OrderStatus ?? existingOrder.OrderStatus;
            existingOrder.PaymentMethod = request.PaymentMethod ?? existingOrder.PaymentMethod;
            existingOrder.ShippingFee = request.ShippingFee;
            existingOrder.UserId = request.UserId;
            existingOrder.OrderDate = request.OrderDate;
            existingOrder.PaymentTxnRef = request.PaymentTxnRef ?? existingOrder.PaymentTxnRef;

            // Remove existing order details
            _context.OrderDetails.RemoveRange(existingOrder.OrderDetails);

            // Add new order details
            decimal totalAmount = 0;
            foreach (var detailDto in request.OrderDetails)
            {
                var detail = new OrderDetail
                {
                    OrderId = existingOrder.OrderId,
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitPrice = detailDto.UnitPrice
                };

                totalAmount += detail.Quantity * detail.UnitPrice;
                existingOrder.OrderDetails.Add(detail);
            }

            existingOrder.TotalAmount = totalAmount + existingOrder.ShippingFee;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // PUT: api/orders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.OrderStatus = status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/orders/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context
                .Orders.Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound();
            }

            // Soft delete order and its details
            order.IsDeleted = true;

            if (order.OrderDetails != null)
            {
                foreach (var detail in order.OrderDetails)
                {
                    detail.IsDeleted = true;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}