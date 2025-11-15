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

        // GET: api/FeedbackQueries/admin
        [HttpGet("admin")]
        public async Task<ActionResult<object>> GetFeedbacksForAdmin(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string search = "",
            [FromQuery] string userId = "",
            [FromQuery] string status = "",
            [FromQuery] string sortBy = "submittedAt")
        {
            Console.WriteLine($"[FEEDBACK] Getting feedback - Page: {page}, PageSize: {pageSize}, Search: {search}, UserId: {userId}, Status: {status}, SortBy: {sortBy}");

            try
            {
                var query = _context.FeedbackQueries
                    .Where(f => !f.IsDeleted)
                    .Include(f => f.ApplicationUser)
                    .AsQueryable();

                // Search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(f => 
                        f.Content.ToLower().Contains(search.ToLower()) ||
                        (f.ApplicationUser != null && f.ApplicationUser.FullName != null && f.ApplicationUser.FullName.ToLower().Contains(search.ToLower())) ||
                        (f.ApplicationUser != null && f.ApplicationUser.Email != null && f.ApplicationUser.Email.ToLower().Contains(search.ToLower())));
                }

                // User filter
                if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int userIdInt))
                {
                    query = query.Where(f => f.UserId == userIdInt);
                }

                // Status filter
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(f => f.FeedbackStatus == status);
                }

                // Count for pagination
                var totalFeedbacks = await query.CountAsync();

                // Calculate statistics
                var feedbacksThisWeek = await _context.FeedbackQueries
                    .Where(f => !f.IsDeleted && f.SubmittedAt >= DateTime.Now.AddDays(-7))
                    .CountAsync();

                var statusDistribution = await _context.FeedbackQueries
                    .Where(f => !f.IsDeleted)
                    .GroupBy(f => f.FeedbackStatus ?? "Pending")
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Status)
                    .ToListAsync();

                var totalUsers = await _context.Users
                    .Where(u => !u.IsDeleted && u.UserType == "Customer")
                    .CountAsync();

                // Sorting
                query = sortBy.ToLower() switch
                {
                    "submittedat" or "submitted_at" => query.OrderByDescending(f => f.SubmittedAt),
                    "content" => query.OrderBy(f => f.Content),
                    "status" => query.OrderBy(f => f.FeedbackStatus ?? "Pending"),
                    "user" => query.OrderBy(f => f.ApplicationUser != null ? f.ApplicationUser.FullName : ""),
                    _ => query.OrderByDescending(f => f.SubmittedAt)
                };

                // Apply pagination
                var feedbacks = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(f => new
                    {
                        FeedbackId = f.FeedbackId,
                        UserId = f.UserId,
                        UserName = f.ApplicationUser != null ? f.ApplicationUser.FullName : "Unknown",
                        UserEmail = f.ApplicationUser != null ? f.ApplicationUser.Email : "",
                        Subject = "Feedback", // Default subject since it's not in the original table
                        Message = f.Content,
                        Priority = "Medium", // Default priority
                        Status = f.FeedbackStatus ?? "Pending",
                        Rating = (int?)null, // Not available in original table
                        CreatedDate = f.SubmittedAt,
                        UpdatedDate = f.SubmittedAt,
                        AdminResponse = (string?)null, // Not available in original table
                        ResponseDate = (DateTime?)null
                    })
                    .ToListAsync();

                Console.WriteLine($"[FEEDBACK] Found {feedbacks.Count} feedbacks out of {totalFeedbacks} total");

                return Ok(new
                {
                    success = true,
                    data = feedbacks,
                    totalItems = totalFeedbacks,
                    currentPage = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalFeedbacks / pageSize),
                    statistics = new
                    {
                        totalFeedbacks = totalFeedbacks,
                        feedbacksThisWeek = feedbacksThisWeek,
                        averageRating = 4.0, // Default value since rating is not in original table
                        statusDistribution = statusDistribution,
                        priorityDistribution = new[] { 
                            new { Priority = "Low", Count = 0 },
                            new { Priority = "Medium", Count = totalFeedbacks },
                            new { Priority = "High", Count = 0 }
                        },
                        totalUsers = totalUsers
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FEEDBACK] Error getting feedbacks: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving feedbacks" });
            }
        }

        // GET: api/FeedbackQueries/admin/statistics
        [HttpGet("admin/statistics")]
        public async Task<ActionResult<object>> GetFeedbackStatistics()
        {
            try
            {
                var totalFeedbacks = await _context.FeedbackQueries.Where(f => !f.IsDeleted).CountAsync();
                var totalUsers = await _context.Users.Where(u => !u.IsDeleted && u.UserType == "Customer").CountAsync();
                var feedbacksThisWeek = await _context.FeedbackQueries
                    .Where(f => !f.IsDeleted && f.SubmittedAt >= DateTime.Now.AddDays(-7))
                    .CountAsync();

                var statusDistribution = await _context.FeedbackQueries
                    .Where(f => !f.IsDeleted)
                    .GroupBy(f => f.FeedbackStatus ?? "Pending")
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .OrderBy(x => x.Status)
                    .ToListAsync();

                Console.WriteLine($"[FEEDBACK] Statistics - Total: {totalFeedbacks}, This Week: {feedbacksThisWeek}");

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalFeedbacks = totalFeedbacks,
                        totalUsers = totalUsers,
                        feedbacksThisWeek = feedbacksThisWeek,
                        averageRating = 4.0,
                        statusDistribution = statusDistribution,
                        priorityDistribution = new[] { 
                            new { Priority = "Low", Count = 0 },
                            new { Priority = "Medium", Count = totalFeedbacks },
                            new { Priority = "High", Count = 0 }
                        },
                        ratingDistribution = new[] {
                            new { Rating = 1, Count = 0 },
                            new { Rating = 2, Count = 0 },
                            new { Rating = 3, Count = 0 },
                            new { Rating = 4, Count = totalFeedbacks / 2 },
                            new { Rating = 5, Count = totalFeedbacks / 2 }
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FEEDBACK] Error getting statistics: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving statistics" });
            }
        }

        // GET: api/FeedbackQueries/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FeedbackQuery>> GetFeedbackQuery(int id)
        {
            try
            {
                Console.WriteLine($"[FEEDBACK] Getting feedback with ID: {id}");

                var feedbackQuery = await _context.FeedbackQueries
                    .Include(f => f.ApplicationUser)
                    .FirstOrDefaultAsync(f => f.FeedbackId == id && !f.IsDeleted);

                if (feedbackQuery == null)
                {
                    Console.WriteLine($"[FEEDBACK] Feedback with ID {id} not found");
                    return NotFound(new { success = false, message = "Feedback not found" });
                }

                Console.WriteLine($"[FEEDBACK] Found feedback: {feedbackQuery.Content}");

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        FeedbackId = feedbackQuery.FeedbackId,
                        UserId = feedbackQuery.UserId,
                        UserName = feedbackQuery.ApplicationUser?.FullName ?? feedbackQuery.ApplicationUser?.UserName,
                        UserEmail = feedbackQuery.ApplicationUser?.Email,
                        Subject = "Feedback",
                        Message = feedbackQuery.Content,
                        Priority = "Medium",
                        Status = feedbackQuery.FeedbackStatus ?? "Pending",
                        Rating = (int?)null,
                        CreatedDate = feedbackQuery.SubmittedAt,
                        UpdatedDate = feedbackQuery.SubmittedAt,
                        AdminResponse = (string?)null,
                        ResponseDate = (DateTime?)null
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FEEDBACK] Error getting feedback: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving feedback" });
            }
        }

        // PUT: api/FeedbackQueries/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeedbackQuery(int id, [FromBody] UpdateFeedbackDto updateData)
        {
            try
            {
                Console.WriteLine($"[FEEDBACK] Updating feedback with ID: {id}");

                var feedbackQuery = await _context.FeedbackQueries.FindAsync(id);
                if (feedbackQuery == null || feedbackQuery.IsDeleted)
                {
                    Console.WriteLine($"[FEEDBACK] Feedback with ID {id} not found");
                    return NotFound(new { success = false, message = "Feedback not found" });
                }

                // Update available fields
                if (!string.IsNullOrEmpty(updateData.Status))
                {
                    feedbackQuery.FeedbackStatus = updateData.Status;
                }

                if (!string.IsNullOrEmpty(updateData.Content))
                {
                    feedbackQuery.Content = updateData.Content;
                }

                // Force Entity Framework to track changes
                _context.Entry(feedbackQuery).State = EntityState.Modified;

                var result = await _context.SaveChangesAsync();
                Console.WriteLine($"[FEEDBACK] SaveChanges result: {result} entities updated");

                if (result > 0)
                {
                    Console.WriteLine($"[FEEDBACK] Successfully updated feedback");
                    return Ok(new { success = true, message = "Feedback updated successfully" });
                }
                else
                {
                    Console.WriteLine($"[FEEDBACK] No changes were saved for feedback {id}");
                    return BadRequest(new { success = false, message = "No changes were made" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FEEDBACK] Error updating feedback: {ex.Message}");
                Console.WriteLine($"[FEEDBACK] Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { success = false, message = "Error updating feedback" });
            }
        }

        // POST: api/FeedbackQueries
        [HttpPost]
        public async Task<ActionResult<FeedbackQuery>> CreateFeedbackQuery([FromBody] CreateFeedbackDto feedbackData)
        {
            try
            {
                Console.WriteLine($"[FEEDBACK] Creating new feedback");

                if (feedbackData.UserId <= 0 || string.IsNullOrEmpty(feedbackData.Content))
                {
                    return BadRequest(new { success = false, message = "UserId and Content are required" });
                }

                var feedbackQuery = new FeedbackQuery
                {
                    UserId = feedbackData.UserId,
                    Content = feedbackData.Content,
                    FeedbackStatus = "Pending",
                    SubmittedAt = DateTime.Now,
                    IsDeleted = false
                };

                _context.FeedbackQueries.Add(feedbackQuery);
                var result = await _context.SaveChangesAsync();

                if (result > 0)
                {
                    Console.WriteLine($"[FEEDBACK] Successfully created feedback");
                    return CreatedAtAction(nameof(GetFeedbackQuery), new { id = feedbackQuery.FeedbackId }, 
                        new { success = true, message = "Feedback created successfully", data = feedbackQuery });
                }
                else
                {
                    Console.WriteLine($"[FEEDBACK] Failed to create feedback");
                    return BadRequest(new { success = false, message = "Failed to create feedback" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FEEDBACK] Error creating feedback: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error creating feedback" });
            }
        }

        // DELETE: api/FeedbackQueries/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedbackQuery(int id)
        {
            try
            {
                Console.WriteLine($"[FEEDBACK] Deleting feedback with ID: {id}");

                var feedbackQuery = await _context.FeedbackQueries.FindAsync(id);
                if (feedbackQuery == null || feedbackQuery.IsDeleted)
                {
                    Console.WriteLine($"[FEEDBACK] Feedback with ID {id} not found");
                    return NotFound(new { success = false, message = "Feedback not found" });
                }

                // Soft delete
                feedbackQuery.IsDeleted = true;

                // Force Entity Framework to track changes
                _context.Entry(feedbackQuery).State = EntityState.Modified;

                var result = await _context.SaveChangesAsync();
                Console.WriteLine($"[FEEDBACK] SaveChanges result: {result} entities updated");

                if (result > 0)
                {
                    Console.WriteLine($"[FEEDBACK] Successfully deleted feedback");
                    return Ok(new { success = true, message = "Feedback deleted successfully" });
                }
                else
                {
                    Console.WriteLine($"[FEEDBACK] No changes were saved for feedback deletion {id}");
                    return BadRequest(new { success = false, message = "Failed to delete feedback" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FEEDBACK] Error deleting feedback: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error deleting feedback" });
            }
        }

        // Customer endpoints
        // GET: api/FeedbackQueries/customer/{userId}
        [HttpGet("customer/{userId}")]
        public async Task<ActionResult<object>> GetCustomerFeedbacks(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                Console.WriteLine($"[FEEDBACK] Getting feedbacks for customer: {userId}");

                var query = _context.FeedbackQueries
                    .Where(f => f.UserId == userId && !f.IsDeleted)
                    .OrderByDescending(f => f.SubmittedAt);

                var totalFeedbacks = await query.CountAsync();

                var feedbacks = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(f => new
                    {
                        FeedbackId = f.FeedbackId,
                        Subject = "Feedback",
                        Message = f.Content,
                        Priority = "Medium",
                        Status = f.FeedbackStatus ?? "Pending",
                        Rating = (int?)null,
                        CreatedDate = f.SubmittedAt,
                        AdminResponse = (string?)null,
                        ResponseDate = (DateTime?)null
                    })
                    .ToListAsync();

                Console.WriteLine($"[FEEDBACK] Found {feedbacks.Count} feedbacks for customer {userId}");

                return Ok(new
                {
                    success = true,
                    data = feedbacks,
                    totalItems = totalFeedbacks,
                    currentPage = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalFeedbacks / pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FEEDBACK] Error getting customer feedbacks: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error retrieving feedbacks" });
            }
        }
    }

    // DTOs
    public class CreateFeedbackDto
    {
        public int UserId { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class UpdateFeedbackDto
    {
        public string? Content { get; set; }
        public string? Status { get; set; }
    }
}