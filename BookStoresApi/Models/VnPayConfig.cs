namespace BookStoresApi.Models
{
    public class VNPayConfig
    {
        public string TmnCode { get; set; } = string.Empty;
        public string HashSecret { get; set; } = string.Empty;
        public string PayUrl { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
        public string ApiUrl { get; set; } = string.Empty; // VNPay Query API endpoint
    }
}
