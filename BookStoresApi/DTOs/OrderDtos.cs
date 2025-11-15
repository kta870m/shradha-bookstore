namespace BookStoresApi.DTOs
{
    public class CreateOrderRequest
    {
        public int UserId { get; set; }
        public decimal ShippingFee { get; set; } = 0;
        public List<CreateOrderDetailDto> OrderDetails { get; set; } = new();
    }

    public class CreateOrderDetailDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderResponse
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string? OrderStatus { get; set; }
        public string? PaymentMethod { get; set; }
        public decimal ShippingFee { get; set; }
        public int UserId { get; set; }
        public List<OrderDetailResponse> OrderDetails { get; set; } = new();
    }

    public class OrderDetailResponse
    {
        public int OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
    }

    // Admin create order request
    public class AdminCreateOrderRequest
    {
        public int UserId { get; set; }
        public decimal ShippingFee { get; set; } = 0;
        public string OrderStatus { get; set; } = "Pending";
        public string? PaymentMethod { get; set; }
        public string? PaymentTxnRef { get; set; }
        public List<AdminOrderDetailDto> OrderDetails { get; set; } = new();
    }

    // Admin order detail DTO
    public class AdminOrderDetailDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    // Update order request
    public class UpdateOrderRequest
    {
        public string? OrderCode { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public string? OrderStatus { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentTxnRef { get; set; }
        public DateTime OrderDate { get; set; }
        public int UserId { get; set; }
    }

    // Full update order request (with order details)
    public class FullUpdateOrderRequest
    {
        public string? OrderCode { get; set; }
        public decimal ShippingFee { get; set; }
        public string? OrderStatus { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentTxnRef { get; set; }
        public DateTime OrderDate { get; set; }
        public int UserId { get; set; }
        public List<AdminOrderDetailDto> OrderDetails { get; set; } = new();
    }
}
