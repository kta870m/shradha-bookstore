using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace BookStoresApi.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        [Required]
        [Column("full_name")]
        [MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Column("address")]
        [MaxLength(500)]
        public string? Address { get; set; }

        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("gender")]
        [MaxLength(20)]
        public string? Gender { get; set; }

        [Required]
        [Column("user_type")]
        [MaxLength(50)]
        public string UserType { get; set; } = string.Empty; // e.g., admin, customer

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<ProductReview> ProductReviews { get; set; } =
            new List<ProductReview>();
        public virtual ICollection<FeedbackQuery> FeedbackQueries { get; set; } =
            new List<FeedbackQuery>();
        public virtual ShoppingCart? ShoppingCart { get; set; }
    }
}
