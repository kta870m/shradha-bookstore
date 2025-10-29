using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class Order
    {
        [Key]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("order_code")]
        [MaxLength(50)]
        public string OrderCode { get; set; } = string.Empty;

        [Column("order_date")]
        public DateTime OrderDate { get; set; }

        [Column("total_amount", TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column("order_status")]
        [MaxLength(50)]
        public string OrderStatus { get; set; } = string.Empty;

        [Column("payment_method")]
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        [Column("shipping_fee", TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; }

        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Column("admin_id")]
        public int? AdminId { get; set; }

        // Navigation properties
        [ForeignKey("CustomerId")]
        public virtual ApplicationUser Customer { get; set; } = null!;

        [ForeignKey("AdminId")]
        public virtual ApplicationUser? Admin { get; set; }

        public virtual ICollection<OrderDetail> OrderDetails { get; set; } =
            new List<OrderDetail>();

        // Audit fields
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("created_by")]
        [MaxLength(255)]
        public string? CreatedBy { get; set; }

        [Column("updated_by")]
        [MaxLength(255)]
        public string? UpdatedBy { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;
    }
}
