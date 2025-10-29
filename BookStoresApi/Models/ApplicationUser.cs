using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace BookStoresApi.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        [Key]
        [Column("user_id")]
        public override int Id { get; set; }


        [Required]
        [Column("full_name")]
        [MaxLength(255)]
        public string FullName { get; set; } = string.Empty;


        [Required]
        [Column("email")]
        [MaxLength(255)]
        public override string Email { get; set; } = string.Empty;


        [Column("address")]
        [MaxLength(500)]
        public string? Address { get; set; }


        [Column("phone_number")]
        [MaxLength(50)]
        public override string? PhoneNumber { get; set; }


        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }


        [Column("gender")]
        [MaxLength(20)]
        public string? Gender { get; set; }


        [Required]
        [Column("password")]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;


        [Required]
        [Column("user_type")]
        [MaxLength(50)]
        public string UserType { get; set; } = string.Empty; // e.g., admin, customer


        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();
        public virtual ICollection<FeedbackQuery> FeedbackQueries { get; set; } = new List<FeedbackQuery>();
        public virtual ShoppingCart? ShoppingCart { get; set; }
    }
}
