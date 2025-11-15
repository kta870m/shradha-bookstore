using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStoresApi.Models
{
    [Table("FeedbackQueries")]
    public class FeedbackQuery
    {
        [Key]
        [Column("feedback_id")]
        public int FeedbackId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("submitted_at")]
        public DateTime SubmittedAt { get; set; } = DateTime.Now;

        [Column("feedback_status")]
        [MaxLength(50)]
        public string? FeedbackStatus { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
    }
}
