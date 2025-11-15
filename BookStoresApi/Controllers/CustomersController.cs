using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Models;
using BookStoresApi.Data;
using System.Text.RegularExpressions;

namespace BookStoresApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public CustomersController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<IActionResult> GetCustomers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            try
            {
                Console.WriteLine($"[CUSTOMERS] Getting customers - Page: {page}, PageSize: {pageSize}, Search: {search}");

                var query = _context.Users
                    .Where(u => !u.IsDeleted && u.UserType == "Customer");

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    query = query.Where(u => 
                        u.FullName.ToLower().Contains(search) ||
                        u.Email.ToLower().Contains(search) ||
                        u.UserName.ToLower().Contains(search) ||
                        (u.PhoneNumber != null && u.PhoneNumber.Contains(search))
                    );
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var customers = await query
                    .OrderByDescending(u => u.Id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new CustomerDto
                    {
                        Id = u.Id,
                        UserName = u.UserName ?? "",
                        Email = u.Email ?? "",
                        FullName = u.FullName ?? "",
                        PhoneNumber = u.PhoneNumber,
                        Address = u.Address,
                        BirthDate = u.BirthDate,
                        Gender = u.Gender,
                        EmailConfirmed = u.EmailConfirmed,
                        CreatedAt = u.Id // Using Id as proxy for creation order
                    })
                    .ToListAsync();

                Console.WriteLine($"[CUSTOMERS] Found {customers.Count} customers out of {totalCount} total");

                return Ok(new
                {
                    customers = customers,
                    pagination = new
                    {
                        currentPage = page,
                        pageSize = pageSize,
                        totalPages = totalPages,
                        totalCount = totalCount,
                        hasNextPage = page < totalPages,
                        hasPrevPage = page > 1
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CUSTOMERS] Error getting customers: {ex.Message}");
                return BadRequest($"Error retrieving customers: {ex.Message}");
            }
        }

        // GET: api/customers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            try
            {
                Console.WriteLine($"[CUSTOMERS] Getting customer with ID: {id}");

                var customer = await _context.Users
                    .Where(u => u.Id == id && !u.IsDeleted && u.UserType == "Customer")
                    .Select(u => new CustomerDto
                    {
                        Id = u.Id,
                        UserName = u.UserName ?? "",
                        Email = u.Email ?? "",
                        FullName = u.FullName ?? "",
                        PhoneNumber = u.PhoneNumber,
                        Address = u.Address,
                        BirthDate = u.BirthDate,
                        Gender = u.Gender,
                        EmailConfirmed = u.EmailConfirmed,
                        CreatedAt = u.Id
                    })
                    .FirstOrDefaultAsync();

                if (customer == null)
                {
                    Console.WriteLine($"[CUSTOMERS] Customer with ID {id} not found");
                    return NotFound($"Customer with ID {id} not found");
                }

                Console.WriteLine($"[CUSTOMERS] Found customer: {customer.FullName}");
                return Ok(customer);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CUSTOMERS] Error getting customer: {ex.Message}");
                return BadRequest($"Error retrieving customer: {ex.Message}");
            }
        }

        // POST: api/customers
        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
        {
            try
            {
                Console.WriteLine($"[CUSTOMERS] Creating new customer: {request.FullName}");

                // Validate email format
                if (!IsValidEmail(request.Email))
                {
                    return BadRequest("Invalid email format");
                }

                // Check if email already exists
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return BadRequest("Email already exists");
                }

                // Check if username already exists
                var existingUsername = await _userManager.FindByNameAsync(request.UserName);
                if (existingUsername != null)
                {
                    return BadRequest("Username already exists");
                }

                var customer = new ApplicationUser
                {
                    UserName = request.UserName,
                    Email = request.Email,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    BirthDate = request.BirthDate,
                    Gender = request.Gender,
                    UserType = "Customer",
                    EmailConfirmed = false,
                    IsDeleted = false
                };

                var result = await _userManager.CreateAsync(customer, request.Password);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    Console.WriteLine($"[CUSTOMERS] Error creating customer: {errors}");
                    return BadRequest($"Error creating customer: {errors}");
                }

                Console.WriteLine($"[CUSTOMERS] Customer created successfully with ID: {customer.Id}");

                var customerDto = new CustomerDto
                {
                    Id = customer.Id,
                    UserName = customer.UserName,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    PhoneNumber = customer.PhoneNumber,
                    Address = customer.Address,
                    BirthDate = customer.BirthDate,
                    Gender = customer.Gender,
                    EmailConfirmed = customer.EmailConfirmed,
                    CreatedAt = customer.Id
                };

                return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customerDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CUSTOMERS] Error creating customer: {ex.Message}");
                return BadRequest($"Error creating customer: {ex.Message}");
            }
        }

        // PUT: api/customers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerRequest request)
        {
            try
            {
                Console.WriteLine($"[CUSTOMERS] Updating customer with ID: {id}");

                var customer = await _userManager.FindByIdAsync(id.ToString());
                if (customer == null || customer.IsDeleted || customer.UserType != "Customer")
                {
                    Console.WriteLine($"[CUSTOMERS] Customer with ID {id} not found");
                    return NotFound($"Customer with ID {id} not found");
                }

                // Validate email format if changed
                if (request.Email != customer.Email && !IsValidEmail(request.Email))
                {
                    return BadRequest("Invalid email format");
                }

                // Check if new email already exists (excluding current user)
                if (request.Email != customer.Email)
                {
                    var existingUser = await _userManager.FindByEmailAsync(request.Email);
                    if (existingUser != null && existingUser.Id != customer.Id)
                    {
                        return BadRequest("Email already exists");
                    }
                }

                // Check if new username already exists (excluding current user)
                if (request.UserName != customer.UserName)
                {
                    var existingUsername = await _userManager.FindByNameAsync(request.UserName);
                    if (existingUsername != null && existingUsername.Id != customer.Id)
                    {
                        return BadRequest("Username already exists");
                    }
                }

                // Update customer information
                customer.UserName = request.UserName;
                customer.Email = request.Email;
                customer.FullName = request.FullName;
                customer.PhoneNumber = request.PhoneNumber;
                customer.Address = request.Address;
                customer.BirthDate = request.BirthDate;
                customer.Gender = request.Gender;

                var result = await _userManager.UpdateAsync(customer);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    Console.WriteLine($"[CUSTOMERS] Error updating customer: {errors}");
                    return BadRequest($"Error updating customer: {errors}");
                }

                // Update password if provided
                if (!string.IsNullOrEmpty(request.NewPassword))
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(customer);
                    var passwordResult = await _userManager.ResetPasswordAsync(customer, token, request.NewPassword);
                    
                    if (!passwordResult.Succeeded)
                    {
                        var errors = string.Join(", ", passwordResult.Errors.Select(e => e.Description));
                        Console.WriteLine($"[CUSTOMERS] Error updating password: {errors}");
                        return BadRequest($"Error updating password: {errors}");
                    }
                }

                Console.WriteLine($"[CUSTOMERS] Customer updated successfully: {customer.FullName}");

                var customerDto = new CustomerDto
                {
                    Id = customer.Id,
                    UserName = customer.UserName,
                    Email = customer.Email,
                    FullName = customer.FullName,
                    PhoneNumber = customer.PhoneNumber,
                    Address = customer.Address,
                    BirthDate = customer.BirthDate,
                    Gender = customer.Gender,
                    EmailConfirmed = customer.EmailConfirmed,
                    CreatedAt = customer.Id
                };

                return Ok(customerDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CUSTOMERS] Error updating customer: {ex.Message}");
                return BadRequest($"Error updating customer: {ex.Message}");
            }
        }

        // DELETE: api/customers/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            try
            {
                Console.WriteLine($"[CUSTOMERS] Soft deleting customer with ID: {id}");

                var customer = await _userManager.FindByIdAsync(id.ToString());
                if (customer == null || customer.IsDeleted || customer.UserType != "Customer")
                {
                    Console.WriteLine($"[CUSTOMERS] Customer with ID {id} not found");
                    return NotFound($"Customer with ID {id} not found");
                }

                // Check if customer has active orders
                var hasActiveOrders = await _context.Orders
                    .AnyAsync(o => o.UserId == id && !o.IsDeleted);

                if (hasActiveOrders)
                {
                    Console.WriteLine($"[CUSTOMERS] Cannot delete customer {id} - has active orders");
                    return BadRequest("Cannot delete customer with active orders. Please cancel all orders first.");
                }

                // Soft delete customer
                customer.IsDeleted = true;
                customer.Email = $"deleted_{customer.Id}_{customer.Email}"; // Prevent email conflicts
                customer.UserName = $"deleted_{customer.Id}_{customer.UserName}"; // Prevent username conflicts

                var result = await _userManager.UpdateAsync(customer);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    Console.WriteLine($"[CUSTOMERS] Error deleting customer: {errors}");
                    return BadRequest($"Error deleting customer: {errors}");
                }

                Console.WriteLine($"[CUSTOMERS] Customer soft deleted successfully: {customer.FullName}");

                return Ok(new { 
                    message = "Customer deleted successfully", 
                    deletedCustomerId = id,
                    customerName = customer.FullName
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CUSTOMERS] Error deleting customer: {ex.Message}");
                return BadRequest($"Error deleting customer: {ex.Message}");
            }
        }

        // GET: api/customers/search
        [HttpGet("search")]
        public async Task<IActionResult> SearchCustomers([FromQuery] string query = "", [FromQuery] int limit = 10)
        {
            try
            {
                Console.WriteLine($"[CUSTOMERS] Searching customers with query: {query}");

                if (string.IsNullOrEmpty(query))
                {
                    return Ok(new List<CustomerSearchDto>());
                }

                var searchTerm = query.ToLower();
                var customers = await _context.Users
                    .Where(u => !u.IsDeleted && u.UserType == "Customer" && (
                        u.FullName.ToLower().Contains(searchTerm) ||
                        u.Email.ToLower().Contains(searchTerm) ||
                        u.UserName.ToLower().Contains(searchTerm) ||
                        (u.PhoneNumber != null && u.PhoneNumber.Contains(searchTerm))
                    ))
                    .Take(limit)
                    .Select(u => new CustomerSearchDto
                    {
                        Id = u.Id,
                        FullName = u.FullName ?? "",
                        Email = u.Email ?? "",
                        PhoneNumber = u.PhoneNumber
                    })
                    .ToListAsync();

                Console.WriteLine($"[CUSTOMERS] Found {customers.Count} customers matching search");
                return Ok(customers);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CUSTOMERS] Error searching customers: {ex.Message}");
                return BadRequest($"Error searching customers: {ex.Message}");
            }
        }

        private static bool IsValidEmail(string email)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return emailRegex.IsMatch(email);
        }
    }

    // DTOs
    public class CustomerDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = "";
        public string Email { get; set; } = "";
        public string FullName { get; set; } = "";
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public bool EmailConfirmed { get; set; }
        public int CreatedAt { get; set; }
    }

    public class CustomerSearchDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }
    }

    public class CreateCustomerRequest
    {
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
    }

    public class UpdateCustomerRequest
    {
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public string? NewPassword { get; set; }
        public required string FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
    }
}