using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    public class FeedbackQuery
    {
        [Key]
        [Column("feedback_id")]
        public int FeedbackId { get; set; }

        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("submitted_at")]
        public DateTime SubmittedAt { get; set; }

        [Column("feedback_status")]
        [MaxLength(50)]
        public string FeedbackStatus { get; set; } = string.Empty;

        [Column("admin_id")]
        public int? AdminId { get; set; }

        // Navigation properties
        [ForeignKey("CustomerId")]
        public virtual ApplicationUser Customer { get; set; } = null!;

        [ForeignKey("AdminId")]
        public virtual ApplicationUser? Admin { get; set; }

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
