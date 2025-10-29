using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class Media
    {
        [Key]
        [Column("media_id")]
        public int MediaId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("media_url")]
        [MaxLength(500)]
        public string MediaUrl { get; set; } = string.Empty;

        [Column("media_type")]
        [MaxLength(50)]
        public string MediaType { get; set; } = string.Empty; // e.g., "image", "video"

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; }

        // Navigation properties
        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

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
