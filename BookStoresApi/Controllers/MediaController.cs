using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Data;
using BookStoresApi.Models;
using System;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MediaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/media
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMedia()
        {
            var mediaList = await _context.Media
                .Where(m => !m.IsDeleted)
                .Select(m => new
                {
                    m.MediaId,
                    m.ProductId,
                    m.MediaUrl,
                    m.MediaType,
                    m.UploadedAt,
                    ProductName = m.Product.ProductName
                })
                .ToListAsync();

            return Ok(mediaList);
        }

        // GET: api/media/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMediaById(int id)
        {
            var media = await _context.Media
                .Where(m => m.MediaId == id && !m.IsDeleted)
                .Select(m => new
                {
                    m.MediaId,
                    m.ProductId,
                    m.MediaUrl,
                    m.MediaType,
                    m.UploadedAt,
                    ProductName = m.Product.ProductName
                })
                .FirstOrDefaultAsync();

            if (media == null)
            {
                return NotFound();
            }

            return Ok(media);
        }

        // GET: api/media/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetMediaByProduct(int productId)
        {
            var mediaList = await _context.Media
                .Where(m => m.ProductId == productId && !m.IsDeleted)
                .Select(m => new
                {
                    m.MediaId,
                    m.ProductId,
                    m.MediaUrl,
                    m.MediaType,
                    m.UploadedAt
                })
                .ToListAsync();

            return Ok(mediaList);
        }

        // POST: api/media
        [HttpPost]
        public async Task<ActionResult<Media>> CreateMedia([FromBody] CreateMediaRequest request)
        {
            // Validate input
            if (request == null)
            {
                return BadRequest("Media request is null");
            }

            if (string.IsNullOrEmpty(request.MediaUrl))
            {
                return BadRequest("Media URL is required");
            }

            if (request.ProductId <= 0)
            {
                return BadRequest("Valid Product ID is required");
            }

            // Check if product exists
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return BadRequest($"Product with ID {request.ProductId} does not exist");
            }

            try
            {
                var media = new Media
                {
                    ProductId = request.ProductId,
                    MediaUrl = request.MediaUrl,
                    MediaType = request.MediaType,
                    UploadedAt = DateTime.Now,
                    IsDeleted = false
                };

                _context.Media.Add(media);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetMediaById), new { id = media.MediaId }, media);
            }
            catch (Exception ex)
            {
                // Log the actual error for debugging
                Console.WriteLine($"Error creating media: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                return BadRequest($"Failed to create media: {ex.Message}");
            }
        }

        // Request model for creating media
        public class CreateMediaRequest
        {
            public int ProductId { get; set; }
            public string MediaUrl { get; set; } = string.Empty;
            public string? MediaType { get; set; }
        }

        // PUT: api/media/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedia(int id, Media media)
        {
            if (id != media.MediaId)
            {
                return BadRequest();
            }

            var existingMedia = await _context.Media.FindAsync(id);
            if (existingMedia == null)
            {
                return NotFound();
            }

            existingMedia.MediaUrl = media.MediaUrl;
            existingMedia.MediaType = media.MediaType;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MediaExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/media/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedia(int id)
        {
            var media = await _context.Media.FindAsync(id);
            if (media == null)
            {
                return NotFound();
            }

            // Soft delete
            media.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/media/product/{productId} - Delete all media for a product
        [HttpDelete("product/{productId}")]
        public async Task<IActionResult> DeleteProductMedia(int productId)
        {
            Console.WriteLine($"[MEDIA] Deleting all media for product ID: {productId}");
            
            try
            {
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Media SET is_deleted = 1 WHERE product_id = {0}",
                    productId);
                    
                Console.WriteLine($"[MEDIA] Deleted {rowsAffected} media records for product {productId}");
                return Ok(new { deletedCount = rowsAffected });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MEDIA] Error deleting product media: {ex.Message}");
                return BadRequest($"Error deleting product media: {ex.Message}");
            }
        }

        private bool MediaExists(int id)
        {
            return _context.Media.Any(e => e.MediaId == id);
        }
    }
}
