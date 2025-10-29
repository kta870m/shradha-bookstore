using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace BookStoresApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        public DateTime? BirthDate { get; set; }

        public string? Gender { get; set; }

        [Required]
        [StringLength(50)]
        public string UserType { get; set; } // e.g., "Customer", "Admin"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
