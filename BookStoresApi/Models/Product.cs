using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [Column("product_code")]
        [MaxLength(100)]
        public string ProductCode { get; set; } = string.Empty;

        [Required]
        [Column("product_name")]
        [MaxLength(255)]
        public string ProductName { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("price", TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column("manufacturer")]
        [MaxLength(255)]
        public string? Manufacturer { get; set; }

        [Column("product_type")]
        [MaxLength(100)]
        public string? ProductType { get; set; }

        [Column("release_date")]
        public DateTime? ReleaseDate { get; set; }

        [Column("stock_quantity")]
        public int StockQuantity { get; set; } = 0;

        [Column("average_rating", TypeName = "decimal(3,2)")]
        public decimal AverageRating { get; set; } = 0;

        [Column("total_reviews")]
        public int TotalReviews { get; set; } = 0;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual ICollection<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
        public virtual ICollection<Media> MediaFiles { get; set; } = new List<Media>();
        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        public virtual ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
