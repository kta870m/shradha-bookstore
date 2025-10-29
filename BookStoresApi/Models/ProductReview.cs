using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class ProductReview
    {
        [Key]
        [Column("review_id")]
        public int ReviewId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Column("rating")]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("review_date")]
        public DateTime ReviewDate { get; set; }

        // Navigation properties
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

        [ForeignKey("CustomerId")]
        public virtual ApplicationUser Customer { get; set; } = null!;

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
