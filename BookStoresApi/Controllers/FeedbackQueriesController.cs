using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Data;
using BookStoresApi.Models;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackQueriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FeedbackQueriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/feedbackqueries
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FeedbackQuery>>> GetFeedbackQueries()
        {
            return await _context.FeedbackQueries
                .Include(fq => fq.User)
                .OrderByDescending(fq => fq.SubmittedAt)
                .ToListAsync();
        }

        // GET: api/feedbackqueries/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<FeedbackQuery>> GetFeedbackQuery(int id)
        {
            var feedbackQuery = await _context.FeedbackQueries
                .Include(fq => fq.User)
                .FirstOrDefaultAsync(fq => fq.FeedbackId == id);

            if (feedbackQuery == null)
            {
                return NotFound();
            }

            return feedbackQuery;
        }

        // GET: api/feedbackqueries/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<FeedbackQuery>>> GetFeedbackByUser(int userId)
        {
            return await _context.FeedbackQueries
                .Include(fq => fq.User)
                .Where(fq => fq.UserId == userId)
                .OrderByDescending(fq => fq.SubmittedAt)
                .ToListAsync();
        }

        // GET: api/feedbackqueries/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<FeedbackQuery>>> GetFeedbackByStatus(string status)
        {
            return await _context.FeedbackQueries
                .Include(fq => fq.User)
                .Where(fq => fq.FeedbackStatus == status)
                .OrderByDescending(fq => fq.SubmittedAt)
                .ToListAsync();
        }

        // POST: api/feedbackqueries
        [HttpPost]
        public async Task<ActionResult<FeedbackQuery>> CreateFeedbackQuery(FeedbackQuery feedbackQuery)
        {
            feedbackQuery.SubmittedAt = DateTime.Now;
            feedbackQuery.FeedbackStatus = "Pending"; // Default status

            _context.FeedbackQueries.Add(feedbackQuery);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFeedbackQuery), new { id = feedbackQuery.FeedbackId }, feedbackQuery);
        }

        // PUT: api/feedbackqueries/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeedbackQuery(int id, FeedbackQuery feedbackQuery)
        {
            if (id != feedbackQuery.FeedbackId)
            {
                return BadRequest();
            }

            var existingFeedback = await _context.FeedbackQueries.FindAsync(id);
            if (existingFeedback == null)
            {
                return NotFound();
            }

            existingFeedback.Content = feedbackQuery.Content;
            existingFeedback.FeedbackStatus = feedbackQuery.FeedbackStatus;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FeedbackQueryExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // PUT: api/feedbackqueries/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateFeedbackStatus(int id, [FromBody] string status)
        {
            var feedback = await _context.FeedbackQueries.FindAsync(id);
            if (feedback == null)
            {
                return NotFound();
            }

            feedback.FeedbackStatus = status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/feedbackqueries/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedbackQuery(int id)
        {
            var feedbackQuery = await _context.FeedbackQueries.FindAsync(id);
            if (feedbackQuery == null)
            {
                return NotFound();
            }

            // Soft delete
            feedbackQuery.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FeedbackQueryExists(int id)
        {
            return _context.FeedbackQueries.Any(e => e.FeedbackId == id);
        }
    }
}
