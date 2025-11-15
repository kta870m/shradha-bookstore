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
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories
                .Include(c => c.ParentCategory)
                .Include(c => c.SubCategories)
                .ToListAsync();
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
                    c.ParentId,
                    FirstLetter = c.CategoryName.Substring(0, 1).ToUpper()
                })
                .ToListAsync();

            // Nếu có categories con (ParentId != null) thì lấy random
            var childCategories = allCategories.Where(c => c.ParentId != null).ToList();
            
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
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, category);
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            if (id != category.CategoryId)
            {
                return BadRequest();
            }

            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return NotFound();
            }

            existingCategory.CategoryName = category.CategoryName;
            existingCategory.ParentId = category.ParentId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/categories/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            // Soft delete
            category.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.CategoryId == id);
        }
    }
}
