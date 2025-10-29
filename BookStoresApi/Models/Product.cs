using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("product_code")]
        [MaxLength(50)]
        public string ProductCode { get; set; } = string.Empty;

        [Column("product_name")]
        [MaxLength(255)]
        public string ProductName { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("price", TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column("manufacturer")]
        [MaxLength(255)]
        public string? Manufacturer { get; set; }

        [Column("product_type")]
        [MaxLength(100)]
        public string? ProductType { get; set; }

        [Column("category_id")]
        public int? CategoryId { get; set; }

        [Column("release_date")]
        public DateTime? ReleaseDate { get; set; }

        [Column("stock_quantity")]
        public int StockQuantity { get; set; }

        [Column("average_rating", TypeName = "decimal(3,2)")]
        public decimal? AverageRating { get; set; }

        [Column("total_reviews")]
        public int TotalReviews { get; set; } = 0;

        // Navigation properties
        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        public virtual ICollection<Media> MediaFiles { get; set; } = new List<Media>();
        public virtual ICollection<OrderDetail> OrderDetails { get; set; } =
            new List<OrderDetail>();
        public virtual ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
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
