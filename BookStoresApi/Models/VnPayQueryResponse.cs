using System.Text.Json.Serialization;

namespace BookStoresApi.Models
{
    public class VnPayQueryResponse
    {
        [JsonPropertyName("vnp_ResponseId")]
        public string? ResponseId { get; set; }

        [JsonPropertyName("vnp_Command")]
        public string? Command { get; set; }

        [JsonPropertyName("vnp_ResponseCode")]
        public string ResponseCode { get; set; } = "99";

        [JsonPropertyName("vnp_Message")]
        public string? Message { get; set; }

        [JsonPropertyName("vnp_TmnCode")]
        public string? TmnCode { get; set; }

        [JsonPropertyName("vnp_TxnRef")]
        public string? TxnRef { get; set; }

        [JsonPropertyName("vnp_Amount")]
        [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
        public long? Amount { get; set; }  // VNPay trả về string, cần convert

        [JsonPropertyName("vnp_OrderInfo")]
        public string? OrderInfo { get; set; }

        [JsonPropertyName("vnp_BankCode")]
        public string? BankCode { get; set; }

        [JsonPropertyName("vnp_PayDate")]
        public string? PayDate { get; set; }

        [JsonPropertyName("vnp_TransactionNo")]
        public string? TransactionNo { get; set; }

        [JsonPropertyName("vnp_TransactionType")]
        public string? TransactionType { get; set; }

        [JsonPropertyName("vnp_TransactionStatus")]
        public string? TransactionStatus { get; set; }

        [JsonPropertyName("vnp_SecureHash")]
        public string? SecureHash { get; set; }
    }
}
