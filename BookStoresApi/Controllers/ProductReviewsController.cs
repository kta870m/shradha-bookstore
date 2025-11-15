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
        public async Task<IActionResult> GetReviews([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] int? productId = null, [FromQuery] int? rating = null, [FromQuery] string sortBy = "reviewDate")
        {
            try
            {
                Console.WriteLine($"[REVIEWS] Getting reviews - Page: {page}, PageSize: {pageSize}, Search: {search}, ProductId: {productId}, Rating: {rating}, SortBy: {sortBy}");

                var query = _context.ProductReviews
                    .Where(r => !r.IsDeleted)
                    .Include(r => r.Product)
                    .ThenInclude(p => p.MediaFiles.Where(m => !m.IsDeleted))
                    .Include(r => r.User)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    query = query.Where(r => 
                        (r.Comment != null && r.Comment.ToLower().Contains(search)) ||
                        r.Product.ProductName.ToLower().Contains(search) ||
                        r.User.FullName.ToLower().Contains(search)
                    );
                }

                if (productId.HasValue)
                {
                    query = query.Where(r => r.ProductId == productId.Value);
                }

                if (rating.HasValue)
                {
                    query = query.Where(r => r.Rating == rating.Value);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                // Apply sorting
                query = sortBy.ToLower() switch
                {
                    "rating" => query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.ReviewDate),
                    "productname" => query.OrderBy(r => r.Product.ProductName).ThenByDescending(r => r.ReviewDate),
                    "username" => query.OrderBy(r => r.User.FullName).ThenByDescending(r => r.ReviewDate),
                    _ => query.OrderByDescending(r => r.ReviewDate)
                };

                var reviews = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new ReviewDto
                    {
                        ReviewId = r.ReviewId,
                        ProductId = r.ProductId,
                        ProductName = r.Product.ProductName,
                        ProductCode = r.Product.ProductCode,
                        UserId = r.UserId,
                        UserName = r.User.FullName,
                        UserEmail = r.User.Email,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        ReviewDate = r.ReviewDate,
                        ProductThumbnail = r.Product.MediaFiles.Where(m => !m.IsDeleted).FirstOrDefault() != null 
                            ? r.Product.MediaFiles.Where(m => !m.IsDeleted).FirstOrDefault().MediaUrl 
                            : null
                    })
                    .ToListAsync();

                Console.WriteLine($"[REVIEWS] Found {reviews.Count} reviews out of {totalCount} total");

                return Ok(new
                {
                    reviews = reviews,
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
                Console.WriteLine($"[REVIEWS] Error getting reviews: {ex.Message}");
                return BadRequest($"Error retrieving reviews: {ex.Message}");
            }
        }

        // GET: api/productreviews/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReview(int id)
        {
            try
            {
                Console.WriteLine($"[REVIEWS] Getting review with ID: {id}");

                var review = await _context.ProductReviews
                    .Where(r => r.ReviewId == id && !r.IsDeleted)
                    .Include(r => r.Product)
                    .ThenInclude(p => p.MediaFiles.Where(m => !m.IsDeleted))
                    .Include(r => r.User)
                    .Select(r => new ReviewDto
                    {
                        ReviewId = r.ReviewId,
                        ProductId = r.ProductId,
                        ProductName = r.Product.ProductName,
                        ProductCode = r.Product.ProductCode,
                        UserId = r.UserId,
                        UserName = r.User.FullName,
                        UserEmail = r.User.Email,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        ReviewDate = r.ReviewDate,
                        ProductThumbnail = r.Product.MediaFiles.Where(m => !m.IsDeleted).FirstOrDefault() != null 
                            ? r.Product.MediaFiles.Where(m => !m.IsDeleted).FirstOrDefault().MediaUrl 
                            : null
                    })
                    .FirstOrDefaultAsync();

                if (review == null)
                {
                    Console.WriteLine($"[REVIEWS] Review with ID {id} not found");
                    return NotFound($"Review with ID {id} not found");
                }

                Console.WriteLine($"[REVIEWS] Found review: {review.ProductName}");
                return Ok(review);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REVIEWS] Error getting review: {ex.Message}");
                return BadRequest($"Error retrieving review: {ex.Message}");
            }
        }

        // POST: api/productreviews
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            try
            {
                Console.WriteLine($"[REVIEWS] Creating new review for product: {request.ProductId}");

                // Check if product exists
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == request.ProductId && !p.IsDeleted);
                if (product == null)
                {
                    return BadRequest("Product not found");
                }

                // Check if user exists
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted);
                if (user == null)
                {
                    return BadRequest("User not found");
                }

                var review = new ProductReview
                {
                    ProductId = request.ProductId,
                    UserId = request.UserId,
                    Rating = request.Rating,
                    Comment = request.Comment,
                    ReviewDate = DateTime.Now,
                    IsDeleted = false
                };

                _context.ProductReviews.Add(review);
                await _context.SaveChangesAsync();

                // Update product average rating
                await UpdateProductRating(request.ProductId);

                Console.WriteLine($"[REVIEWS] Review created successfully with ID: {review.ReviewId}");

                var reviewDto = new ReviewDto
                {
                    ReviewId = review.ReviewId,
                    ProductId = review.ProductId,
                    ProductName = product.ProductName,
                    ProductCode = product.ProductCode,
                    UserId = review.UserId,
                    UserName = user.FullName,
                    UserEmail = user.Email,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ReviewDate = review.ReviewDate
                };

                return CreatedAtAction(nameof(GetReview), new { id = review.ReviewId }, reviewDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REVIEWS] Error creating review: {ex.Message}");
                return BadRequest($"Error creating review: {ex.Message}");
            }
        }

        // PUT: api/productreviews/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewRequest request)
        {
            try
            {
                Console.WriteLine($"[REVIEWS] Updating review with ID: {id}");
                Console.WriteLine($"[REVIEWS] Request data - Rating: {request.Rating}, Comment: {request.Comment}");

                var review = await _context.ProductReviews
                    .Include(r => r.Product)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.ReviewId == id && !r.IsDeleted);

                if (review == null)
                {
                    Console.WriteLine($"[REVIEWS] Review with ID {id} not found");
                    return NotFound($"Review with ID {id} not found");
                }

                Console.WriteLine($"[REVIEWS] Updating review - Old Rating: {review.Rating}, New Rating: {request.Rating}");
                Console.WriteLine($"[REVIEWS] Updating review - Old Comment: {review.Comment}, New Comment: {request.Comment}");
                
                review.Rating = request.Rating;
                review.Comment = request.Comment;

                // Force entity tracking to detect changes
                _context.Entry(review).State = EntityState.Modified;

                Console.WriteLine($"[REVIEWS] Calling SaveChangesAsync...");
                var changes = await _context.SaveChangesAsync();
                Console.WriteLine($"[REVIEWS] SaveChangesAsync completed, {changes} entities updated");

                if (changes == 0)
                {
                    Console.WriteLine($"[REVIEWS] Warning: No changes were saved to database!");
                }

                // Update product average rating
                await UpdateProductRating(review.ProductId);

                Console.WriteLine($"[REVIEWS] Review updated successfully: {review.ReviewId}");

                var reviewDto = new ReviewDto
                {
                    ReviewId = review.ReviewId,
                    ProductId = review.ProductId,
                    ProductName = review.Product.ProductName,
                    ProductCode = review.Product.ProductCode,
                    UserId = review.UserId,
                    UserName = review.User.FullName,
                    UserEmail = review.User.Email,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ReviewDate = review.ReviewDate
                };

                return Ok(reviewDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REVIEWS] Error updating review: {ex.Message}");
                return BadRequest($"Error updating review: {ex.Message}");
            }
        }

        // DELETE: api/productreviews/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                Console.WriteLine($"[REVIEWS] Soft deleting review with ID: {id}");

                var review = await _context.ProductReviews
                    .FirstOrDefaultAsync(r => r.ReviewId == id && !r.IsDeleted);

                if (review == null)
                {
                    Console.WriteLine($"[REVIEWS] Review with ID {id} not found");
                    return NotFound($"Review with ID {id} not found");
                }

                Console.WriteLine($"[REVIEWS] Setting IsDeleted = true for review {id}");
                review.IsDeleted = true;
                
                // Force entity tracking to detect changes
                _context.Entry(review).State = EntityState.Modified;
                
                Console.WriteLine($"[REVIEWS] Calling SaveChangesAsync for delete...");
                var changes = await _context.SaveChangesAsync();
                Console.WriteLine($"[REVIEWS] SaveChangesAsync completed, {changes} entities updated");

                if (changes == 0)
                {
                    Console.WriteLine($"[REVIEWS] Warning: No changes were saved to database for delete!");
                }

                // Update product average rating
                await UpdateProductRating(review.ProductId);

                Console.WriteLine($"[REVIEWS] Review soft deleted successfully: {review.ReviewId}");

                return Ok(new { 
                    message = "Review deleted successfully", 
                    deletedReviewId = id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REVIEWS] Error deleting review: {ex.Message}");
                return BadRequest($"Error deleting review: {ex.Message}");
            }
        }

        // GET: api/productreviews/statistics
        [HttpGet("statistics")]
        public async Task<IActionResult> GetReviewStatistics()
        {
            try
            {
                var totalReviews = await _context.ProductReviews.CountAsync(r => !r.IsDeleted);
                var averageRating = await _context.ProductReviews
                    .Where(r => !r.IsDeleted)
                    .AverageAsync(r => (double?)r.Rating) ?? 0;

                var ratingDistribution = await _context.ProductReviews
                    .Where(r => !r.IsDeleted)
                    .GroupBy(r => r.Rating)
                    .Select(g => new { Rating = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Rating)
                    .ToListAsync();

                var recentReviews = await _context.ProductReviews
                    .Where(r => !r.IsDeleted)
                    .Where(r => r.ReviewDate >= DateTime.Now.AddDays(-7))
                    .CountAsync();

                return Ok(new
                {
                    totalReviews,
                    averageRating = Math.Round(averageRating, 2),
                    ratingDistribution,
                    recentReviews
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REVIEWS] Error getting statistics: {ex.Message}");
                return BadRequest($"Error retrieving statistics: {ex.Message}");
            }
        }

        private async Task UpdateProductRating(int productId)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null) return;

                var reviews = await _context.ProductReviews
                    .Where(r => r.ProductId == productId && !r.IsDeleted)
                    .ToListAsync();

                if (reviews.Any())
                {
                    product.AverageRating = (decimal)reviews.Average(r => r.Rating);
                    product.TotalReviews = reviews.Count;
                }
                else
                {
                    product.AverageRating = 0;
                    product.TotalReviews = 0;
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"[REVIEWS] Updated product {productId} rating: {product.AverageRating} ({product.TotalReviews} reviews)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[REVIEWS] Error updating product rating: {ex.Message}");
            }
        }
    }

    // DTOs
    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductThumbnail { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime ReviewDate { get; set; }
    }

    public class CreateReviewRequest
    {
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class UpdateReviewRequest
    {
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
