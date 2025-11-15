namespace BookStoresApi.DTOs
{
    public class PaymentRequest
    {
        public int OrderId { get; set; }
        public string ReturnUrl { get; set; } = string.Empty;
    }

    public class PaymentResponse
    {
        public string PaymentUrl { get; set; } = string.Empty;
    }
}
