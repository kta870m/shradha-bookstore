using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Data;
using BookStoresApi.Models;

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
        public async Task<ActionResult<IEnumerable<Media>>> GetMedia()
        {
            return await _context.Media
                .Include(m => m.Product)
                .ToListAsync();
        }

        // GET: api/media/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Media>> GetMediaById(int id)
        {
            var media = await _context.Media
                .Include(m => m.Product)
                .FirstOrDefaultAsync(m => m.MediaId == id);

            if (media == null)
            {
                return NotFound();
            }

            return media;
        }

        // GET: api/media/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<Media>>> GetMediaByProduct(int productId)
        {
            return await _context.Media
                .Where(m => m.ProductId == productId)
                .ToListAsync();
        }

        // POST: api/media
        [HttpPost]
        public async Task<ActionResult<Media>> CreateMedia(Media media)
        {
            media.UploadedAt = DateTime.Now;

            _context.Media.Add(media);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMediaById), new { id = media.MediaId }, media);
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

        private bool MediaExists(int id)
        {
            return _context.Media.Any(e => e.MediaId == id);
        }
    }
}
