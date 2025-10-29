using BookStoresApi.Data;
using BookStoresApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public OrdersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/orders/new-code
        [HttpGet("new-code")]
        public async Task<IActionResult> GetNewOrderCode()
        {
            string newCode = "OR000001"; // default fallback

            var connStr = _configuration.GetConnectionString("DefaultConnection");
            using (var conn = new SqlConnection(connStr))
            {
                string query =
                    @"
                    SELECT ISNULL(
                        (
                            SELECT TOP 1
                                LEFT(order_code, PATINDEX('%[0-9]%', order_code) - 1) +
                                RIGHT('000000' + CAST(CAST(SUBSTRING(order_code, PATINDEX('%[0-9]%', order_code), LEN(order_code)) AS INT) + 1 AS VARCHAR), 6)
                            FROM Orders
                            WHERE
                                order_code LIKE '[A-Za-z]%' AND
                                PATINDEX('%[0-9]%', order_code) > 0 AND
                                ISNUMERIC(SUBSTRING(order_code, PATINDEX('%[0-9]%', order_code), LEN(order_code))) = 1
                            ORDER BY
                                CAST(SUBSTRING(order_code, PATINDEX('%[0-9]%', order_code), LEN(order_code)) AS INT) DESC
                        ),
                        'OR000001'
                    ) AS NewCode;
                ";

                using (var cmd = new SqlCommand(query, conn))
                {
                    await conn.OpenAsync();
                    var result = await cmd.ExecuteScalarAsync();
                    if (result != null && result != DBNull.Value)
                    {
                        newCode = result.ToString();
                    }
                }
            }

            return Ok(new { orderCode = newCode });
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context
                .Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context
                .Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // GET: api/orders/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(int customerId)
        {
            return await _context
                .Orders.Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Where(o => o.UserId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            // Auto-generate order code if not provided
            if (string.IsNullOrEmpty(order.OrderCode))
            {
                var codeResult = await GetNewOrderCode();
                var codeValue = (codeResult as OkObjectResult)?.Value;
                var codeProperty = codeValue?.GetType().GetProperty("orderCode");
                order.OrderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";
            }

            order.OrderDate = DateTime.Now;

            // Calculate total amount from order details
            if (order.OrderDetails != null && order.OrderDetails.Any())
            {
                order.TotalAmount =
                    order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice) + order.ShippingFee;
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, order);
        }

        // PUT: api/orders/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Order order)
        {
            if (id != order.OrderId)
            {
                return BadRequest();
            }

            var existingOrder = await _context.Orders.FindAsync(id);
            if (existingOrder == null)
            {
                return NotFound();
            }

            existingOrder.OrderStatus = order.OrderStatus;
            existingOrder.PaymentMethod = order.PaymentMethod;
            existingOrder.ShippingFee = order.ShippingFee;
            existingOrder.TotalAmount = order.TotalAmount;
            existingOrder.UserId = order.UserId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // PUT: api/orders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.OrderStatus = status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/orders/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context
                .Orders.Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound();
            }

            // Soft delete order and its details
            order.IsDeleted = true;

            if (order.OrderDetails != null)
            {
                foreach (var detail in order.OrderDetails)
                {
                    detail.IsDeleted = true;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}
