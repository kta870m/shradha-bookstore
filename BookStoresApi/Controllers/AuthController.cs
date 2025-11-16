using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BookStoresApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BookStoresApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration
        )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            // Try to find user by email
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || user.IsDeleted)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var token = GenerateJwtToken(user);
            return Ok(
                new
                {
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        userType = user.UserType,
                    },
                }
            );
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new ApplicationUser
            {
                UserName = model.Username ?? model.Email,
                Email = model.Email,
                FullName = model.FullName,
                PhoneNumber = model.PhoneNumber,
                Address = model.Address,
                BirthDate = model.BirthDate,
                Gender = model.Gender,
                UserType = model.UserType,
            };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                var token = GenerateJwtToken(user);
                return Ok(new { token });
            }

            return BadRequest(result.Errors);
        }

        private string GenerateJwtToken(ApplicationUser user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName ?? user.Email),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Sid, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("user_type", user.UserType ?? "Customer"),
                new Claim("full_name", user.FullName ?? ""),
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // GET: api/auth/users/search?q=keyword&limit=20
        [HttpGet("users/search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchUsers(
            [FromQuery] string? q = null,
            [FromQuery] int limit = 20
        )
        {
            var query = _userManager.Users
                .Where(u => !u.IsDeleted && u.UserType == "customer");

            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(u => 
                    u.FullName.Contains(q) || 
                    u.Id.ToString().Contains(q) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(q)) ||
                    u.Email.Contains(q)
                );
            }

            var users = query
                .OrderBy(u => u.FullName)
                .Take(limit)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.Address
                })
                .ToList();

            return Ok(users);
        }

        // GET: api/auth/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<object>> GetProfile()
        {
            // Get userId from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.Sid)?.Value 
                           ?? User.FindFirst("sid")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            
            if (user == null || user.IsDeleted)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                phoneNumber = user.PhoneNumber,
                address = user.Address,
                birthDate = user.BirthDate,
                gender = user.Gender,
                userType = user.UserType
            });
        }

        // PUT: api/auth/profile
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest model)
        {
            // Get userId from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.Sid)?.Value 
                           ?? User.FindFirst("sid")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            
            if (user == null || user.IsDeleted)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update user fields
            if (!string.IsNullOrEmpty(model.FullName))
                user.FullName = model.FullName;
            
            if (!string.IsNullOrEmpty(model.PhoneNumber))
                user.PhoneNumber = model.PhoneNumber;
            
            if (!string.IsNullOrEmpty(model.Address))
                user.Address = model.Address;
            
            if (model.BirthDate.HasValue)
                user.BirthDate = model.BirthDate;
            
            if (!string.IsNullOrEmpty(model.Gender))
                user.Gender = model.Gender;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { message = "Profile updated successfully" });
            }

            return BadRequest(new { message = "Failed to update profile", errors = result.Errors });
        }

        // PUT: api/auth/change-password
        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest model)
        {
            // Get userId from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.Sid)?.Value 
                           ?? User.FindFirst("sid")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            
            if (user == null || user.IsDeleted)
            {
                return NotFound(new { message = "User not found" });
            }

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

            if (result.Succeeded)
            {
                return Ok(new { message = "Password changed successfully" });
            }

            return BadRequest(new { message = "Failed to change password", errors = result.Errors });
        }

        // GET: api/auth/users - Get all users (Admin only)
        [HttpGet("users")]
        [Authorize]
        public async Task<ActionResult<object>> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            // Check if requester is admin
            var userType = User.FindFirst("user_type")?.Value;
            if (userType?.ToLower() != "admin")
            {
                return Forbid();
            }

            var query = _userManager.Users.Where(u => !u.IsDeleted);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u =>
                    u.FullName.Contains(search) ||
                    u.Email.Contains(search) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(search)) ||
                    u.UserName.Contains(search)
                );
            }

            var totalCount = query.Count();
            var users = query
                .OrderBy(u => u.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.FullName,
                    u.PhoneNumber,
                    u.Address,
                    u.BirthDate,
                    u.Gender,
                    u.UserType,
                    u.EmailConfirmed
                })
                .ToList();

            return Ok(new
            {
                users = users,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalCount = totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                }
            });
        }

        // POST: api/auth/users - Create user (Admin can create Admin accounts)
        [HttpPost("users")]
        [Authorize]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest model)
        {
            // Check if requester is admin
            var userType = User.FindFirst("user_type")?.Value;
            var isAdmin = userType?.ToLower() == "admin";

            // Only admin can create admin accounts
            if (model.UserType?.ToLower() == "admin" && !isAdmin)
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new ApplicationUser
            {
                UserName = model.UserName ?? model.Email,
                Email = model.Email,
                FullName = model.FullName,
                PhoneNumber = model.PhoneNumber,
                Address = model.Address,
                BirthDate = model.BirthDate,
                Gender = model.Gender,
                UserType = model.UserType ?? "Customer",
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                return Ok(new { message = $"{user.UserType} account created successfully", userId = user.Id });
            }

            return BadRequest(result.Errors);
        }

        // PUT: api/auth/users/{id} - Update user (Admin only)
        [HttpPut("users/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest model)
        {
            // Check if requester is admin
            var userType = User.FindFirst("user_type")?.Value;
            if (userType?.ToLower() != "admin")
            {
                return Forbid();
            }

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || user.IsDeleted)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update fields
            if (!string.IsNullOrEmpty(model.UserName))
                user.UserName = model.UserName;
            if (!string.IsNullOrEmpty(model.Email))
                user.Email = model.Email;
            if (!string.IsNullOrEmpty(model.FullName))
                user.FullName = model.FullName;
            if (!string.IsNullOrEmpty(model.PhoneNumber))
                user.PhoneNumber = model.PhoneNumber;
            if (!string.IsNullOrEmpty(model.Address))
                user.Address = model.Address;
            if (model.BirthDate.HasValue)
                user.BirthDate = model.BirthDate;
            if (!string.IsNullOrEmpty(model.Gender))
                user.Gender = model.Gender;
            if (!string.IsNullOrEmpty(model.UserType))
                user.UserType = model.UserType;

            var result = await _userManager.UpdateAsync(user);

            // Update password if provided
            if (!string.IsNullOrEmpty(model.NewPassword))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            }

            if (result.Succeeded)
            {
                return Ok(new { message = "User updated successfully" });
            }

            return BadRequest(new { message = "Failed to update user", errors = result.Errors });
        }

        // DELETE: api/auth/users/{id} - Delete user (Admin only)
        [HttpDelete("users/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id)
        {
            // Check if requester is admin
            var userType = User.FindFirst("user_type")?.Value;
            if (userType?.ToLower() != "admin")
            {
                return Forbid();
            }

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || user.IsDeleted)
            {
                return NotFound(new { message = "User not found" });
            }

            // Soft delete
            user.IsDeleted = true;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { message = "User deleted successfully" });
            }

            return BadRequest(new { message = "Failed to delete user", errors = result.Errors });
        }
    }

    public class CreateUserRequest
    {
        public string? UserName { get; set; }
        public required string Password { get; set; }
        public required string Email { get; set; }
        public required string FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? UserType { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? UserType { get; set; }
        public string? NewPassword { get; set; }
    }

    public class RegisterRequest
    {
        public string? Username { get; set; }
        public required string Password { get; set; }
        public required string Email { get; set; }

        public required string FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public required string UserType { get; set; }
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
    }

    public class ChangePasswordRequest
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}
