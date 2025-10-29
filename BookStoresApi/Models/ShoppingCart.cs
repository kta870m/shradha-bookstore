using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class ShoppingCart
    {
        [Key]
        [Column("cart_id")]
        public int CartId { get; set; }

        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "Active";

        // Navigation properties
        [ForeignKey("CustomerId")]
        public virtual ApplicationUser Customer { get; set; } = null!;

        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

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
