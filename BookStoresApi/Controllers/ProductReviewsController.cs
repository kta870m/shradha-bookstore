using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Data;
using BookStoresApi.Models;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/productreviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductReview>>> GetProductReviews()
        {
            return await _context.ProductReviews
                .Include(pr => pr.Product)
                .Include(pr => pr.User)
                .OrderByDescending(pr => pr.ReviewDate)
                .ToListAsync();
        }

        // GET: api/productreviews/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductReview>> GetProductReview(int id)
        {
            var productReview = await _context.ProductReviews
                .Include(pr => pr.Product)
                .Include(pr => pr.User)
                .FirstOrDefaultAsync(pr => pr.ReviewId == id);

            if (productReview == null)
            {
                return NotFound();
            }

            return productReview;
        }

        // GET: api/productreviews/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<ProductReview>>> GetReviewsByProduct(int productId)
        {
            return await _context.ProductReviews
                .Include(pr => pr.User)
                .Where(pr => pr.ProductId == productId)
                .OrderByDescending(pr => pr.ReviewDate)
                .ToListAsync();
        }

        // GET: api/productreviews/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ProductReview>>> GetReviewsByUser(int userId)
        {
            return await _context.ProductReviews
                .Include(pr => pr.Product)
                .Where(pr => pr.UserId == userId)
                .OrderByDescending(pr => pr.ReviewDate)
                .ToListAsync();
        }

        // POST: api/productreviews
        [HttpPost]
        public async Task<ActionResult<ProductReview>> CreateProductReview(ProductReview productReview)
        {
            productReview.ReviewDate = DateTime.Now;

            _context.ProductReviews.Add(productReview);
            await _context.SaveChangesAsync();

            // Update product average rating and total reviews
            await UpdateProductRating(productReview.ProductId);

            return CreatedAtAction(nameof(GetProductReview), new { id = productReview.ReviewId }, productReview);
        }

        // PUT: api/productreviews/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProductReview(int id, ProductReview productReview)
        {
            if (id != productReview.ReviewId)
            {
                return BadRequest();
            }

            var existingReview = await _context.ProductReviews.FindAsync(id);
            if (existingReview == null)
            {
                return NotFound();
            }

            existingReview.Rating = productReview.Rating;
            existingReview.Comment = productReview.Comment;

            try
            {
                await _context.SaveChangesAsync();
                // Update product average rating
                await UpdateProductRating(existingReview.ProductId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductReviewExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/productreviews/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductReview(int id)
        {
            var productReview = await _context.ProductReviews.FindAsync(id);
            if (productReview == null)
            {
                return NotFound();
            }

            var productId = productReview.ProductId;

            // Soft delete
            productReview.IsDeleted = true;
            await _context.SaveChangesAsync();

            // Update product average rating
            await UpdateProductRating(productId);

            return NoContent();
        }

        private bool ProductReviewExists(int id)
        {
            return _context.ProductReviews.Any(e => e.ReviewId == id);
        }

        private async Task UpdateProductRating(int productId)
        {
            var product = await _context.Products
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product != null)
            {
                var reviews = product.Reviews.Where(r => !r.IsDeleted).ToList();
                product.TotalReviews = reviews.Count;
                product.AverageRating = reviews.Any() ? (decimal)reviews.Average(r => r.Rating) : 0;
                await _context.SaveChangesAsync();
            }
        }
    }
}
