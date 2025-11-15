using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Data;
using BookStoresApi.Models;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => !c.IsDeleted)
                .Select(c => new
                {
                    c.CategoryId,
                    c.CategoryName,
                    c.ParentCategoryId
                })
                .OrderBy(c => c.CategoryName)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/categories/featured?limit=15
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<object>>> GetFeaturedCategories([FromQuery] int limit = 15)
        {
            // Debug: Lấy TẤT CẢ categories để xem có gì
            var allCategories = await _context.Categories
                .Where(c => !c.IsDeleted)
                .Select(c => new
                {
                    c.CategoryId,
                    c.CategoryName,
                    c.ParentCategoryId,
                    FirstLetter = c.CategoryName.Substring(0, 1).ToUpper()
                })
                .ToListAsync();

            // Nếu có categories con (ParentId != null) thì lấy random
            var childCategories = allCategories.Where(c => c.ParentCategoryId != null).ToList();
            
            if (childCategories.Any())
            {
                // Có categories con, random và lấy limit
                return Ok(childCategories.OrderBy(x => Guid.NewGuid()).Take(limit));
            }
            else
            {
                // Không có categories con, trả về tất cả (kể cả Book level)
                return Ok(allCategories.OrderBy(x => Guid.NewGuid()).Take(limit));
            }
        }

        // GET: api/categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.ParentCategory)
                .Include(c => c.SubCategories)
                .Include(c => c.ProductCategories)
                    .ThenInclude(pc => pc.Product)
                .FirstOrDefaultAsync(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            try
            {
                Console.WriteLine($"[CATEGORIES] Creating new category");
                Console.WriteLine($"[CATEGORIES] Request data: {System.Text.Json.JsonSerializer.Serialize(request)}");
                
                var category = new Category
                {
                    CategoryName = request.CategoryName,
                    ParentCategoryId = request.ParentCategoryId,
                    IsDeleted = false
                };

                _context.Categories.Add(category);
                var changes = await _context.SaveChangesAsync();
                Console.WriteLine($"[CATEGORIES] SaveChanges affected {changes} rows, new ID: {category.CategoryId}");

                // Load the created category with navigation properties
                var createdCategory = await _context.Categories
                    .Include(c => c.ParentCategory)
                    .Include(c => c.SubCategories)
                    .FirstOrDefaultAsync(c => c.CategoryId == category.CategoryId);

                return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, createdCategory);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CATEGORIES] Error creating category: {ex.Message}");
                return BadRequest($"Error creating category: {ex.Message}");
            }
        }

        // Request model for creating category
        public class CreateCategoryRequest
        {
            public string CategoryName { get; set; } = string.Empty;
            public int? ParentCategoryId { get; set; }
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
        {
            try
            {
                Console.WriteLine($"[CATEGORIES] Updating category ID: {id}");
                Console.WriteLine($"[CATEGORIES] Request data: {System.Text.Json.JsonSerializer.Serialize(request)}");
                
                // Use direct SQL update to bypass tracking issues
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Categories SET category_name = {0}, parent_id = {1} WHERE category_id = {2}",
                    request.CategoryName, 
                    request.ParentCategoryId, 
                    id);
                    
                Console.WriteLine($"[CATEGORIES] Direct SQL update affected {rowsAffected} rows");
                
                if (rowsAffected == 0)
                {
                    return NotFound($"Category with ID {id} not found");
                }

                // Return the updated category
                var updatedCategory = await _context.Categories
                    .Include(c => c.ParentCategory)
                    .Include(c => c.SubCategories.Where(sc => !sc.IsDeleted))
                    .FirstOrDefaultAsync(c => c.CategoryId == id && !c.IsDeleted);
                
                return Ok(updatedCategory);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CATEGORIES] Error updating category: {ex.Message}");
                return BadRequest($"Error updating category: {ex.Message}");
            }
        }

        // Request model for updating category
        public class UpdateCategoryRequest
        {
            public string CategoryName { get; set; } = string.Empty;
            public int? ParentCategoryId { get; set; }
        }

        // DELETE: api/categories/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                Console.WriteLine($"[CATEGORIES] Deleting category ID: {id}");
                
                // Use direct SQL to soft delete
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Categories SET is_deleted = 1 WHERE category_id = {0} AND is_deleted = 0",
                    id);
                    
                Console.WriteLine($"[CATEGORIES] Soft delete affected {rowsAffected} rows");
                
                if (rowsAffected == 0)
                {
                    Console.WriteLine($"[CATEGORIES] Category with ID {id} not found or already deleted");
                    return NotFound($"Category with ID {id} not found");
                }

                return Ok(new { message = "Category deleted successfully", deletedId = id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CATEGORIES] Error deleting category: {ex.Message}");
                return BadRequest($"Error deleting category: {ex.Message}");
            }
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.CategoryId == id);
        }
    }
}
