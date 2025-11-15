using System;
using BookStoresApi.Data;
using BookStoresApi.DTOs;
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
                    if (result != null)
                    {
                        newCode = result.ToString() ?? "OR000001";
                    }
                }
            }

            return Ok(new { orderCode = newCode });
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<object>> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? search = null
        )
        {
            try
            {
                Console.WriteLine($"[ORDERS] Getting orders - Page: {page}, PageSize: {pageSize}, Status: {status}, Search: {search}");

                var query = _context.Orders
                    .Where(o => !o.IsDeleted)
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails.Where(od => !od.IsDeleted))
                    .ThenInclude(od => od.Product)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(o => o.OrderStatus == status);
                }

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(o => 
                        o.OrderCode.Contains(search) ||
                        o.User.FullName.Contains(search) ||
                        o.PaymentTxnRef.Contains(search)
                    );
                }

                var totalItems = await query.CountAsync();
                
                var orders = await query
                    .OrderByDescending(o => o.OrderDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                Console.WriteLine($"[ORDERS] Found {totalItems} total orders, returning {orders.Count} for page {page}");

                return Ok(new
                {
                    items = orders,
                    totalItems,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ORDERS] Error getting orders: {ex.Message}");
                return BadRequest($"Error getting orders: {ex.Message}");
            }
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            Console.WriteLine($"[ORDERS] Getting order details for ID: {id}");
            
            var order = await _context
                .Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails.Where(od => !od.IsDeleted))
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles.Where(m => !m.IsDeleted))
                .FirstOrDefaultAsync(o => o.OrderId == id && !o.IsDeleted);

            if (order == null)
            {
                Console.WriteLine($"[ORDERS] Order with ID {id} not found");
                return NotFound();
            }

            Console.WriteLine($"[ORDERS] Found order {id} with {order.OrderDetails.Count} order details");
            foreach (var detail in order.OrderDetails)
            {
                Console.WriteLine($"[ORDERS] Order detail: ProductId={detail.ProductId}, ProductName={detail.Product?.ProductName}, IsDeleted={detail.IsDeleted}");
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
            try
            {
                Console.WriteLine($"[ORDERS] Creating new order for user: {order.UserId}");
                
                // Auto-generate order code if not provided
                if (string.IsNullOrEmpty(order.OrderCode))
                {
                    var codeResult = await GetNewOrderCode();
                    var codeValue = (codeResult as OkObjectResult)?.Value;
                    var codeProperty = codeValue?.GetType().GetProperty("orderCode");
                    order.OrderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";
                }

                // Auto-generate payment transaction reference if not provided
                if (string.IsNullOrEmpty(order.PaymentTxnRef))
                {
                    order.PaymentTxnRef = Guid.NewGuid().ToString("N").Substring(0, 20);
                }

                order.OrderDate = DateTime.Now;
                order.IsDeleted = false;

                // Calculate total amount from order details
                if (order.OrderDetails != null && order.OrderDetails.Any())
                {
                    order.TotalAmount =
                        order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice) + order.ShippingFee;
                        
                    // Ensure all order details are properly set
                    foreach (var detail in order.OrderDetails)
                    {
                        detail.IsDeleted = false;
                    }
                }

                _context.Orders.Add(order);
                var result = await _context.SaveChangesAsync();
                
                Console.WriteLine($"[ORDERS] Order created successfully with ID: {order.OrderId}");

                // Return the created order with full details
                var createdOrder = await _context.Orders
                    .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                    .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);

                return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, createdOrder);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ORDERS] Error creating order: {ex.Message}");
                return BadRequest($"Error creating order: {ex.Message}");
            }
        }

        // POST: api/orders/create (Simplified version)
        [HttpPost("create")]
        public async Task<ActionResult<OrderResponse>> CreateOrderSimple(CreateOrderRequest request)
        {
            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Validate products and get prices
            var productIds = request.OrderDetails.Select(od => od.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                return BadRequest(new { message = "One or more products not found" });
            }

            // Generate order code
            var codeResult = await GetNewOrderCode();
            var codeValue = (codeResult as OkObjectResult)?.Value;
            var codeProperty = codeValue?.GetType().GetProperty("orderCode");
            string orderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";

            // Generate unique payment transaction reference (UUID 20 chars like Java)
            string paymentTxnRef = Guid.NewGuid().ToString("N").Substring(0, 20);

            // Create order
            var order = new Order
            {
                OrderCode = orderCode,
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                OrderStatus = "Pending",
                ShippingFee = request.ShippingFee,
                PaymentTxnRef = paymentTxnRef,
                OrderDetails = new List<OrderDetail>()
            };

            // Create order details and calculate total
            decimal totalAmount = 0;
            foreach (var detailDto in request.OrderDetails)
            {
                var product = products.First(p => p.ProductId == detailDto.ProductId);
                var detail = new OrderDetail
                {
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitPrice = product.Price
                };

                totalAmount += detail.Quantity * detail.UnitPrice;
                order.OrderDetails.Add(detail);
            }

            order.TotalAmount = totalAmount + order.ShippingFee;

            // Save to database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            var createdOrder = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstAsync(o => o.OrderId == order.OrderId);

            // Map to response
            var response = new OrderResponse
            {
                OrderId = createdOrder.OrderId,
                OrderCode = createdOrder.OrderCode,
                OrderDate = createdOrder.OrderDate,
                TotalAmount = createdOrder.TotalAmount,
                OrderStatus = createdOrder.OrderStatus,
                PaymentMethod = createdOrder.PaymentMethod,
                ShippingFee = createdOrder.ShippingFee,
                UserId = createdOrder.UserId,
                OrderDetails = createdOrder.OrderDetails.Select(od => new OrderDetailResponse
                {
                    OrderDetailId = od.OrderDetailId,
                    ProductId = od.ProductId,
                    ProductName = od.Product.ProductName,
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Quantity * od.UnitPrice
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, response);
        }

        // POST: api/orders/admin-create (For admin to create simple orders)
        [HttpPost("admin-create")]
        public async Task<ActionResult<Order>> CreateOrderAdmin(AdminCreateOrderRequest request)
        {
            try
            {
                Console.WriteLine($"[ORDERS] Admin creating new order for user: {request.UserId}");
                
                // Validate user exists
                var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
                if (!userExists)
                {
                    return BadRequest(new { message = "User not found" });
                }

                // Validate order details
                if (request.OrderDetails == null || !request.OrderDetails.Any())
                {
                    return BadRequest(new { message = "Order must have at least one product" });
                }

                // Validate products exist and get their details
                var productIds = request.OrderDetails.Select(od => od.ProductId).ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                    .ToListAsync();

                if (products.Count != productIds.Count)
                {
                    return BadRequest(new { message = "One or more products not found" });
                }

                // Auto-generate order code
                var codeResult = await GetNewOrderCode();
                var codeValue = (codeResult as OkObjectResult)?.Value;
                var codeProperty = codeValue?.GetType().GetProperty("orderCode");
                string orderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";

                // Calculate total amount from order details
                decimal totalAmount = 0;
                var orderDetails = new List<OrderDetail>();

                foreach (var detailDto in request.OrderDetails)
                {
                    var product = products.First(p => p.ProductId == detailDto.ProductId);
                    var detail = new OrderDetail
                    {
                        ProductId = detailDto.ProductId,
                        Quantity = detailDto.Quantity,
                        UnitPrice = detailDto.UnitPrice > 0 ? detailDto.UnitPrice : product.Price, // Use provided price or product price
                        IsDeleted = false
                    };

                    totalAmount += detail.Quantity * detail.UnitPrice;
                    orderDetails.Add(detail);
                }

                // Create order
                var order = new Order
                {
                    OrderCode = orderCode,
                    UserId = request.UserId,
                    TotalAmount = totalAmount + request.ShippingFee,
                    ShippingFee = request.ShippingFee,
                    OrderStatus = request.OrderStatus,
                    PaymentMethod = request.PaymentMethod,
                    PaymentTxnRef = request.PaymentTxnRef ?? Guid.NewGuid().ToString("N").Substring(0, 20),
                    OrderDate = DateTime.Now,
                    IsDeleted = false,
                    OrderDetails = orderDetails
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[ORDERS] Admin order created successfully with ID: {order.OrderId}");

                // Return the created order
                var createdOrder = await _context.Orders
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);

                return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, createdOrder);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ORDERS] Error creating admin order: {ex.Message}");
                return BadRequest(new { message = $"Error creating order: {ex.Message}" });
            }
        }

        // PUT: api/orders/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderRequest request)
        {
            try
            {
                Console.WriteLine($"[ORDERS] Updating order ID: {id}");
                Console.WriteLine($"[ORDERS] Request data: {System.Text.Json.JsonSerializer.Serialize(request)}");
                
                // Use direct SQL update to bypass tracking issues
                // Find existing order
                var existingOrder = await _context.Orders
                    .Where(o => o.OrderId == id && o.IsDeleted == false)
                    .FirstOrDefaultAsync();
                
                if (existingOrder == null)
                {
                    return NotFound($"Order with ID {id} not found");
                }
                
                // Update properties
                existingOrder.OrderCode = request.OrderCode;
                existingOrder.TotalAmount = request.TotalAmount;
                existingOrder.OrderStatus = request.OrderStatus;
                existingOrder.PaymentMethod = request.PaymentMethod;
                existingOrder.PaymentTxnRef = request.PaymentTxnRef;
                existingOrder.ShippingFee = request.ShippingFee;
                existingOrder.OrderDate = request.OrderDate;
                existingOrder.UserId = request.UserId;
                
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[ORDERS] Order {id} updated successfully using EF Core");

                // Return the updated order
                var updatedOrder = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                    .FirstOrDefaultAsync(o => o.OrderId == id && !o.IsDeleted);
                
                return Ok(updatedOrder);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ORDERS] Error updating order: {ex.Message}");
                return BadRequest($"Error updating order: {ex.Message}");
            }
        }

        // PUT: api/orders/{id}/full-update (Update order with order details)
        [HttpPut("{id}/full-update")]
        public async Task<IActionResult> FullUpdateOrder(int id, [FromBody] FullUpdateOrderRequest request)
        {
            try
            {
                Console.WriteLine($"[ORDERS] Full updating order ID: {id}");
                Console.WriteLine($"[ORDERS] Request data: {System.Text.Json.JsonSerializer.Serialize(request)}");
                
                // Validate user exists
                var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
                if (!userExists)
                {
                    return BadRequest(new { message = "User not found" });
                }

                // Validate order details
                if (request.OrderDetails == null || !request.OrderDetails.Any())
                {
                    return BadRequest(new { message = "Order must have at least one product" });
                }

                // Validate products exist
                var productIds = request.OrderDetails.Select(od => od.ProductId).ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                    .ToListAsync();

                if (products.Count != productIds.Count)
                {
                    return BadRequest(new { message = "One or more products not found" });
                }

                // Calculate total amount from order details
                decimal totalAmount = 0;
                foreach (var detailDto in request.OrderDetails)
                {
                    var product = products.First(p => p.ProductId == detailDto.ProductId);
                    var unitPrice = detailDto.UnitPrice > 0 ? detailDto.UnitPrice : product.Price;
                    totalAmount += detailDto.Quantity * unitPrice;
                }

                // Get existing order
                var existingOrder = await _context.Orders
                    .FirstOrDefaultAsync(o => o.OrderId == id && !o.IsDeleted);

                if (existingOrder == null)
                {
                    return NotFound($"Order with ID {id} not found");
                }

                // Update order using Entity Framework
                existingOrder.OrderCode = request.OrderCode;
                existingOrder.TotalAmount = totalAmount + request.ShippingFee;
                existingOrder.OrderStatus = request.OrderStatus;
                existingOrder.PaymentMethod = request.PaymentMethod;
                existingOrder.PaymentTxnRef = request.PaymentTxnRef;
                existingOrder.ShippingFee = request.ShippingFee;
                existingOrder.OrderDate = request.OrderDate;
                existingOrder.UserId = request.UserId;

                // Soft delete existing order details using raw SQL
                Console.WriteLine($"[ORDERS] Soft deleting existing order details for order {id}");
                var deletedCount = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE OrderDetails SET is_deleted = 1 WHERE order_id = {0} AND is_deleted = 0",
                    id);
                Console.WriteLine($"[ORDERS] Soft deleted {deletedCount} existing order details");

                // Add new order details using raw SQL
                Console.WriteLine($"[ORDERS] Adding {request.OrderDetails.Count} new order details");
                foreach (var detailDto in request.OrderDetails)
                {
                    var product = products.First(p => p.ProductId == detailDto.ProductId);
                    var unitPrice = detailDto.UnitPrice > 0 ? detailDto.UnitPrice : product.Price;

                    await _context.Database.ExecuteSqlRawAsync(
                        @"INSERT INTO OrderDetails (order_id, product_id, quantity, unit_price, is_deleted) 
                          VALUES ({0}, {1}, {2}, {3}, 0)",
                        id, detailDto.ProductId, detailDto.Quantity, unitPrice);
                    
                    Console.WriteLine($"[ORDERS] Added order detail: ProductId={detailDto.ProductId}, Quantity={detailDto.Quantity}");
                }

                Console.WriteLine($"[ORDERS] Full update completed for order ID: {id}");

                // Return the updated order
                var updatedOrder = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails.Where(od => !od.IsDeleted))
                    .ThenInclude(od => od.Product)
                    .FirstOrDefaultAsync(o => o.OrderId == id && !o.IsDeleted);

                return Ok(updatedOrder);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ORDERS] Error in full update order: {ex.Message}");
                return BadRequest($"Error updating order: {ex.Message}");
            }
        }

        // Request model for updating order
        public class UpdateOrderRequest
        {
            public string OrderCode { get; set; } = string.Empty;
            public decimal TotalAmount { get; set; }
            public string? OrderStatus { get; set; }
            public string? PaymentMethod { get; set; }
            public string? PaymentTxnRef { get; set; }
            public decimal ShippingFee { get; set; }
            public DateTime OrderDate { get; set; }
            public int UserId { get; set; }
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
            try
            {
                Console.WriteLine($"[ORDERS] Deleting order ID: {id}");
                
                // Use direct SQL to soft delete order
                var orderRowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Orders SET is_deleted = 1 WHERE order_id = {0} AND is_deleted = 0",
                    id);
                    
                Console.WriteLine($"[ORDERS] Order soft delete affected {orderRowsAffected} rows");
                
                if (orderRowsAffected == 0)
                {
                    Console.WriteLine($"[ORDERS] Order with ID {id} not found or already deleted");
                    return NotFound($"Order with ID {id} not found");
                }

                // Also soft delete all order details
                var detailRowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE OrderDetails SET is_deleted = 1 WHERE order_id = {0} AND is_deleted = 0",
                    id);
                    
                Console.WriteLine($"[ORDERS] Order details soft delete affected {detailRowsAffected} rows");

                return Ok(new { 
                    message = "Order deleted successfully", 
                    deletedOrderId = id,
                    deletedDetailsCount = detailRowsAffected
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ORDERS] Error deleting order: {ex.Message}");
                return BadRequest($"Error deleting order: {ex.Message}");
            }
        }

        // POST: api/orders/{id}/cleanup-duplicates
        [HttpPost("{id}/cleanup-duplicates")]
        public async Task<IActionResult> CleanupDuplicateOrderDetails(int id)
        {
            try
            {
                Console.WriteLine($"[CLEANUP] Starting cleanup for Order ID: {id}");
                
                // First, let's see what we have
                var duplicateCheck = await _context.Database.SqlQueryRaw<int>(
                    "SELECT COUNT(*) as Value FROM OrderDetails WHERE order_id = {0} AND is_deleted = 0",
                    id).FirstOrDefaultAsync();
                    
                Console.WriteLine($"[CLEANUP] Found {duplicateCheck} active order details for order {id}");
                
                if (duplicateCheck <= 0)
                {
                    return NotFound($"No active order details found for order {id}");
                }
                
                // Get count of duplicate products
                var duplicateProductsCount = await _context.Database.SqlQueryRaw<int>(
                    @"SELECT COUNT(DISTINCT product_id) as Value
                      FROM (
                          SELECT product_id, COUNT(*) as cnt
                          FROM OrderDetails 
                          WHERE order_id = {0} AND is_deleted = 0 
                          GROUP BY product_id 
                          HAVING COUNT(*) > 1
                      ) duplicates",
                    id).FirstOrDefaultAsync();
                    
                Console.WriteLine($"[CLEANUP] Found duplicates for {duplicateProductsCount} products");
                
                // Strategy: Keep only the most recent record for each product_id
                // This uses a window function to identify duplicates and delete all but the newest
                var cleanupQuery = @"
                    WITH RankedDetails AS (
                        SELECT order_detail_id,
                               ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY order_detail_id DESC) as rn
                        FROM OrderDetails 
                        WHERE order_id = {0} AND is_deleted = 0
                    )
                    UPDATE OrderDetails 
                    SET is_deleted = 1 
                    WHERE order_detail_id IN (
                        SELECT order_detail_id 
                        FROM RankedDetails 
                        WHERE rn > 1
                    )";
                
                var deletedCount = await _context.Database.ExecuteSqlRawAsync(cleanupQuery, id);
                
                Console.WriteLine($"[CLEANUP] Soft deleted {deletedCount} duplicate order details");
                
                // Verify cleanup
                var remainingCount = await _context.Database.SqlQueryRaw<int>(
                    "SELECT COUNT(*) as Value FROM OrderDetails WHERE order_id = {0} AND is_deleted = 0",
                    id).FirstOrDefaultAsync();
                    
                Console.WriteLine($"[CLEANUP] Remaining active order details: {remainingCount}");
                
                return Ok(new { 
                    message = "Cleanup completed successfully",
                    orderId = id,
                    duplicatesRemoved = deletedCount,
                    remainingDetails = remainingCount
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CLEANUP] Error during cleanup: {ex.Message}");
                Console.WriteLine($"[CLEANUP] Stack trace: {ex.StackTrace}");
                return BadRequest($"Error during cleanup: {ex.Message}");
            }
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}