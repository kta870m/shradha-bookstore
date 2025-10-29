using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class Category
    {
        [Key]
        [Column("category_id")]
        public int CategoryId { get; set; }

        [Column("category_name")]
        [MaxLength(255)]
        public string CategoryName { get; set; } = string.Empty;

        [Column("parent_id")]
        public int? ParentId { get; set; }

        // Navigation properties
        [ForeignKey("ParentId")]
        public virtual Category? ParentCategory { get; set; }

        public virtual ICollection<Category> SubCategories { get; set; } = new List<Category>();
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();

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
