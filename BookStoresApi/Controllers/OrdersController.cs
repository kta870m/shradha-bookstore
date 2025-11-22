using BookStoresApi.Data;
using BookStoresApi.DTOs;
using BookStoresApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
                        newCode = result.ToString() ?? "OR000001";
                    }
                }
            }

            return Ok(new { orderCode = newCode });
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            // This endpoint returns ALL orders (for admin use)
            // For customer-specific orders, use GET /api/orders/my-orders
            
            return await _context
                .Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .OrderByDescending(o => o.OrderCode)
                .ToListAsync();
        }

        // GET: api/orders/my-orders (Get orders for current logged-in user)
        [HttpGet("my-orders")]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            // Debug: Log all claims
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
            }
            
            // Try to get userId from JWT token claims using different claim types
            var userIdClaim = User.FindFirst(ClaimTypes.Sid)?.Value 
                           ?? User.FindFirst("sid")?.Value
                           ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid")?.Value;
            
            Console.WriteLine($"UserIdClaim extracted: {userIdClaim}");
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated or userId not found in token" });
            }
            
            Console.WriteLine($"Filtering orders for userId: {userId}");
            
            // Return only user's orders
            var userOrders = await _context
                .Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .OrderByDescending(o => o.OrderCode)
                .ToListAsync();
                
            Console.WriteLine($"Found {userOrders.Count} orders for user {userId}");
            return userOrders;
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponse>> GetOrder(int id)
        {
            var order = await _context
                .Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound();
            }

            // Map to OrderResponse
            var response = new OrderResponse
            {
                OrderId = order.OrderId,
                OrderCode = order.OrderCode,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                PaymentMethod = order.PaymentMethod,
                ShippingFee = order.ShippingFee,
                UserId = order.UserId,
                User = order.User != null ? new UserInfo
                {
                    Id = order.User.Id,
                    FullName = order.User.FullName ?? string.Empty,
                    Email = order.User.Email,
                    PhoneNumber = order.User.PhoneNumber,
                    Address = order.User.Address
                } : null,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailResponse
                {
                    OrderDetailId = od.OrderDetailId,
                    ProductId = od.ProductId,
                    ProductName = od.Product?.ProductName ?? "Unknown",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Quantity * od.UnitPrice,
                    Product = od.Product != null ? new ProductInfo
                    {
                        ProductId = od.Product.ProductId,
                        ProductCode = od.Product.ProductCode,
                        ProductName = od.Product.ProductName,
                        Price = od.Product.Price,
                        MediaFiles = od.Product.MediaFiles?.Select(m => new MediaInfo
                        {
                            MediaId = m.MediaId,
                            MediaUrl = m.MediaUrl,
                            MediaType = m.MediaType
                        }).ToList() ?? new List<MediaInfo>()
                    } : null
                }).ToList()
            };

            return response;
        }

        // GET: api/orders/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(int customerId)
        {
            return await _context
                .Orders.Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ThenInclude(p => p.MediaFiles)
                .Where(o => o.UserId == customerId)
                .OrderByDescending(o => o.OrderCode)
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

            // Auto-generate payment transaction reference if not provided
            if (string.IsNullOrEmpty(order.PaymentTxnRef))
            {
                order.PaymentTxnRef = Guid.NewGuid().ToString("N").Substring(0, 20);
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

            // Determine initial order status based on payment method
            string initialStatus = "Pending";
            if (!string.IsNullOrEmpty(request.PaymentMethod) && 
                request.PaymentMethod.Equals("COD", StringComparison.OrdinalIgnoreCase))
            {
                initialStatus = "Confirmed"; // COD orders are confirmed immediately
            }

            // Validate stock availability if order is in a confirmed state
            if (ShouldReduceStock(initialStatus))
            {
                var orderItems = request.OrderDetails.Select(od => (productId: od.ProductId, quantity: od.Quantity)).ToList();
                var (isValid, errorMessage) = await ValidateStockAvailability(orderItems);
                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }
            }

            // Create order
            var order = new Order
            {
                OrderCode = orderCode,
                UserId = request.UserId,
                OrderDate = DateTime.Now,
                OrderStatus = initialStatus,
                PaymentMethod = request.PaymentMethod,
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

            // Save order to database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Reduce stock if order is in a confirmed state
            if (ShouldReduceStock(initialStatus))
            {
                var orderItems = request.OrderDetails.Select(od => (productId: od.ProductId, quantity: od.Quantity)).ToList();
                await ReduceStockForOrderItems(orderItems);
            }

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
                    ProductName = od.Product?.ProductName ?? "Unknown",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Quantity * od.UnitPrice,
                    Product = od.Product != null ? new ProductInfo
                    {
                        ProductId = od.Product.ProductId,
                        ProductCode = od.Product.ProductCode,
                        ProductName = od.Product.ProductName,
                        Price = od.Product.Price,
                        MediaFiles = od.Product.MediaFiles?.Select(m => new MediaInfo
                        {
                            MediaId = m.MediaId,
                            MediaUrl = m.MediaUrl,
                            MediaType = m.MediaType
                        }).ToList() ?? new List<MediaInfo>()
                    } : null
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, response);
        }

        // POST: api/orders/admin-create (For admin to create order with custom status and date)
        [HttpPost("admin-create")]
        public async Task<ActionResult<OrderResponse>> AdminCreateOrder(AdminCreateOrderRequest request)
        {
            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "User not found" });
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

            // Determine final order status
            string finalStatus = request.OrderStatus ?? "Pending";

            // Validate stock availability if order is in a confirmed state
            if (ShouldReduceStock(finalStatus))
            {
                var orderItems = request.OrderDetails.Select(od => (productId: od.ProductId, quantity: od.Quantity)).ToList();
                var (isValid, errorMessage) = await ValidateStockAvailability(orderItems);
                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }
            }

            // Generate order code
            var codeResult = await GetNewOrderCode();
            var codeValue = (codeResult as OkObjectResult)?.Value;
            var codeProperty = codeValue?.GetType().GetProperty("orderCode");
            string orderCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "OR000001";

            // Generate unique payment transaction reference if not provided
            string paymentTxnRef = request.PaymentTxnRef ?? Guid.NewGuid().ToString("N").Substring(0, 20);

            // Create order with admin-specified status and date
            var order = new Order
            {
                OrderCode = orderCode,
                UserId = request.UserId,
                OrderDate = request.OrderDate ?? DateTime.Now, // Use admin-specified date or current date
                OrderStatus = finalStatus,
                PaymentMethod = request.PaymentMethod,
                ShippingFee = request.ShippingFee,
                PaymentTxnRef = paymentTxnRef,
                OrderDetails = new List<OrderDetail>()
            };

            // Create order details with admin-specified unit prices
            decimal totalAmount = 0;
            foreach (var detailDto in request.OrderDetails)
            {
                var detail = new OrderDetail
                {
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitPrice = detailDto.UnitPrice // Use admin-specified unit price
                };

                totalAmount += detail.Quantity * detail.UnitPrice;
                order.OrderDetails.Add(detail);
            }

            order.TotalAmount = totalAmount + order.ShippingFee;

            // Save order to database
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Reduce stock if order is in a confirmed state
            if (ShouldReduceStock(finalStatus))
            {
                var orderItems = request.OrderDetails.Select(od => (productId: od.ProductId, quantity: od.Quantity)).ToList();
                await ReduceStockForOrderItems(orderItems);
            }

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
                    ProductName = od.Product?.ProductName ?? "Unknown",
                    Quantity = od.Quantity,
                    UnitPrice = od.UnitPrice,
                    Subtotal = od.Quantity * od.UnitPrice,
                    Product = od.Product != null ? new ProductInfo
                    {
                        ProductId = od.Product.ProductId,
                        ProductCode = od.Product.ProductCode,
                        ProductName = od.Product.ProductName,
                        Price = od.Product.Price,
                        MediaFiles = od.Product.MediaFiles?.Select(m => new MediaInfo
                        {
                            MediaId = m.MediaId,
                            MediaUrl = m.MediaUrl,
                            MediaType = m.MediaType
                        }).ToList() ?? new List<MediaInfo>()
                    } : null
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, response);
        }

        // PUT: api/orders/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Order order)
        {
            if (id != order.OrderId)
            {
                return BadRequest();
            }

            var existingOrder = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (existingOrder == null)
            {
                return NotFound();
            }

            string oldStatus = existingOrder.OrderStatus ?? "Pending";
            string newStatus = order.OrderStatus ?? "Pending";

            // Check if we need to handle stock changes
            bool oldWasConfirmed = ShouldReduceStock(oldStatus);
            bool newWillBeConfirmed = ShouldReduceStock(newStatus);
            bool newShouldRestore = ShouldRestoreStock(newStatus);

            // Get order items for stock management
            var orderItems = existingOrder.OrderDetails
                .Where(od => !od.IsDeleted)
                .Select(od => (od.ProductId, od.Quantity))
                .ToList();

            // Validate stock availability if order is being confirmed
            if (!oldWasConfirmed && newWillBeConfirmed)
            {
                var (isValid, errorMessage) = await ValidateStockAvailability(orderItems);
                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }
            }

            // Restore stock if order is being cancelled/failed and was previously confirmed
            if (oldWasConfirmed && (newShouldRestore || !newWillBeConfirmed))
            {
                await RestoreStockForOrderItems(orderItems);
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

            // Reduce stock if order is being confirmed and wasn't before
            if (!oldWasConfirmed && newWillBeConfirmed)
            {
                await ReduceStockForOrderItems(orderItems);
            }

            return NoContent();
        }

        // PUT: api/orders/{id}/full-update (For admin to update order with order details)
        [HttpPut("{id}/full-update")]
        public async Task<IActionResult> FullUpdateOrder(int id, FullUpdateOrderRequest request)
        {
            var existingOrder = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (existingOrder == null)
            {
                return NotFound();
            }

            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "User not found" });
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

            // Store old order status and details for stock management
            string oldStatus = existingOrder.OrderStatus ?? "Pending";
            var oldOrderItems = existingOrder.OrderDetails
                .Select(od => (od.ProductId, od.Quantity))
                .ToList();

            // Determine new order status
            string newStatus = request.OrderStatus ?? existingOrder.OrderStatus ?? "Pending";

            // Validate stock availability if new order is in a confirmed state
            if (ShouldReduceStock(newStatus))
            {
                var newOrderItems = request.OrderDetails.Select(od => (productId: od.ProductId, quantity: od.Quantity)).ToList();
                var (isValid, errorMessage) = await ValidateStockAvailability(newOrderItems);
                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }
            }

            // Update order properties
            existingOrder.OrderStatus = newStatus;
            existingOrder.PaymentMethod = request.PaymentMethod ?? existingOrder.PaymentMethod;
            existingOrder.ShippingFee = request.ShippingFee;
            existingOrder.UserId = request.UserId;
            existingOrder.OrderDate = request.OrderDate;
            existingOrder.PaymentTxnRef = request.PaymentTxnRef ?? existingOrder.PaymentTxnRef;

            // Handle stock adjustments based on status changes
            bool oldWasConfirmed = ShouldReduceStock(oldStatus);
            bool newWillBeConfirmed = ShouldReduceStock(newStatus);

            if (oldWasConfirmed && newWillBeConfirmed)
            {
                // Order was confirmed and will remain confirmed - restore old stock, reduce new stock
                await RestoreStockForOrderItems(oldOrderItems);
            }
            else if (oldWasConfirmed && !newWillBeConfirmed)
            {
                // Order was confirmed but will no longer be - restore old stock
                await RestoreStockForOrderItems(oldOrderItems);
            }
            // If order was not confirmed and will become confirmed, stock will be reduced after save

            // Remove existing order details
            _context.OrderDetails.RemoveRange(existingOrder.OrderDetails);

            // Add new order details
            decimal totalAmount = 0;
            foreach (var detailDto in request.OrderDetails)
            {
                var detail = new OrderDetail
                {
                    OrderId = existingOrder.OrderId,
                    ProductId = detailDto.ProductId,
                    Quantity = detailDto.Quantity,
                    UnitPrice = detailDto.UnitPrice
                };

                totalAmount += detail.Quantity * detail.UnitPrice;
                existingOrder.OrderDetails.Add(detail);
            }

            existingOrder.TotalAmount = totalAmount + existingOrder.ShippingFee;

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

            // Reduce stock if order is now in a confirmed state (and wasn't before, or was and we already restored)
            if (newWillBeConfirmed)
            {
                var newOrderItems = request.OrderDetails.Select(od => (productId: od.ProductId, quantity: od.Quantity)).ToList();
                await ReduceStockForOrderItems(newOrderItems);
            }

            return NoContent();
        }

        // PUT: api/orders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound();
            }

            string oldStatus = order.OrderStatus ?? "Pending";
            string newStatus = status;

            // Check if we need to handle stock changes
            bool oldWasConfirmed = ShouldReduceStock(oldStatus);
            bool newWillBeConfirmed = ShouldReduceStock(newStatus);
            bool newShouldRestore = ShouldRestoreStock(newStatus);

            // Get order items for stock management
            var orderItems = order.OrderDetails
                .Where(od => !od.IsDeleted)
                .Select(od => (od.ProductId, od.Quantity))
                .ToList();

            // Validate stock availability if order is being confirmed
            if (!oldWasConfirmed && newWillBeConfirmed)
            {
                var (isValid, errorMessage) = await ValidateStockAvailability(orderItems);
                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }
            }

            // Restore stock if order is being cancelled/failed and was previously confirmed
            if (oldWasConfirmed && (newShouldRestore || !newWillBeConfirmed))
            {
                await RestoreStockForOrderItems(orderItems);
            }

            // Update order status
            order.OrderStatus = newStatus;
            await _context.SaveChangesAsync();

            // Reduce stock if order is being confirmed and wasn't before
            if (!oldWasConfirmed && newWillBeConfirmed)
            {
                await ReduceStockForOrderItems(orderItems);
            }

            return NoContent();
        }

        // DELETE: api/orders/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                Console.WriteLine($"[DELETE ORDER] Starting deletion of order {id}");

                var order = await _context
                    .Orders.Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                    .FirstOrDefaultAsync(o => o.OrderId == id);

                if (order == null)
                {
                    Console.WriteLine($"[DELETE ORDER] Order {id} not found");
                    return NotFound();
                }

                Console.WriteLine($"[DELETE ORDER] Order {id} found. Status: {order.OrderStatus}, IsDeleted: {order.IsDeleted}");

                // Restore stock if order was confirmed (stock was previously reduced)
                if (ShouldReduceStock(order.OrderStatus))
                {
                    Console.WriteLine($"[DELETE ORDER] Order {id} is confirmed. Restoring stock...");
                    var orderItems = order.OrderDetails
                        .Where(od => !od.IsDeleted)
                        .Select(od => (productId: od.ProductId, quantity: od.Quantity))
                        .ToList();
                    
                    if (orderItems.Any())
                    {
                        // Use the helper method which uses direct SQL
                        await RestoreStockForOrderItems(orderItems);
                    }
                }

                // Soft delete order and its details
                Console.WriteLine($"[DELETE ORDER] Setting IsDeleted = true for order {id}");
                order.IsDeleted = true;
                _context.Entry(order).State = Microsoft.EntityFrameworkCore.EntityState.Modified;

                if (order.OrderDetails != null)
                {
                    foreach (var detail in order.OrderDetails)
                    {
                        if (!detail.IsDeleted)
                        {
                            detail.IsDeleted = true;
                            _context.Entry(detail).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                        }
                    }
                    Console.WriteLine($"[DELETE ORDER] Set IsDeleted = true for {order.OrderDetails.Count} order details");
                }

                // Save all changes (stock restoration + order deletion) in one transaction
                Console.WriteLine($"[DELETE ORDER] Saving changes for order {id}...");
                var saveResult = await _context.SaveChangesAsync();
                Console.WriteLine($"[DELETE ORDER] SaveChanges completed. Affected rows: {saveResult}");

                await transaction.CommitAsync();
                Console.WriteLine($"[DELETE ORDER] Transaction committed for order {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[DELETE ORDER] ERROR deleting order {id}: {ex.Message}");
                Console.WriteLine($"[DELETE ORDER] Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[DELETE ORDER] Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = $"Error deleting order: {ex.Message}" });
            }
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }

        // Helper method to check if order status should trigger stock reduction
        private bool ShouldReduceStock(string? orderStatus)
        {
            if (string.IsNullOrEmpty(orderStatus))
                return false;

            var status = orderStatus.ToLower();
            return status == "confirmed" || status == "paid" || status == "processing" || 
                   status == "completed" || status == "successful";
        }

        // Helper method to check if order status should restore stock
        private bool ShouldRestoreStock(string? orderStatus)
        {
            if (string.IsNullOrEmpty(orderStatus))
                return false;

            var status = orderStatus.ToLower();
            return status == "cancelled" || status == "failed";
        }

        // Helper method to validate stock availability
        private async Task<(bool isValid, string? errorMessage)> ValidateStockAvailability(
            List<(int productId, int quantity)> orderItems)
        {
            var productIds = orderItems.Select(item => item.productId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .ToListAsync();

            foreach (var item in orderItems)
            {
                var product = products.FirstOrDefault(p => p.ProductId == item.productId);
                if (product == null)
                {
                    return (false, $"Product with ID {item.productId} not found");
                }

                if (product.StockQuantity < item.quantity)
                {
                    return (false, 
                        $"Insufficient stock for product '{product.ProductName}'. " +
                        $"Available: {product.StockQuantity}, Requested: {item.quantity}");
                }
            }

            return (true, null);
        }

        // Helper method to reduce stock for order items
        private async Task ReduceStockForOrderItems(List<(int productId, int quantity)> orderItems)
        {
            foreach (var item in orderItems)
            {
                // Get current stock before update
                var productBefore = await _context.Products
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(p => p.ProductId == item.productId && !p.IsDeleted);
                
                int currentStock = productBefore?.StockQuantity ?? 0;
                Console.WriteLine($"[REDUCE STOCK] Product {item.productId}: Current stock = {currentStock}, Reducing {item.quantity} units");

                // Use direct SQL update to ensure stock is actually reduced in database
                // This bypasses EF tracking issues and query filters
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    @"UPDATE Products 
                      SET stock_quantity = CASE 
                          WHEN stock_quantity >= {1} THEN stock_quantity - {1}
                          ELSE 0
                      END
                      WHERE product_id = {0} AND is_deleted = 0",
                    item.productId,
                    item.quantity);

                // Refresh context and query again to verify
                _context.ChangeTracker.Clear();
                var productAfter = await _context.Products
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(p => p.ProductId == item.productId && !p.IsDeleted);

                if (productAfter != null)
                {
                    int expectedStock = Math.Max(0, currentStock - item.quantity);
                    Console.WriteLine($"[REDUCE STOCK] Product {item.productId}: Expected stock = {expectedStock}, Actual stock = {productAfter.StockQuantity}, Rows affected: {rowsAffected}");
                    
                    if (productAfter.StockQuantity != expectedStock)
                    {
                        Console.WriteLine($"[REDUCE STOCK] ERROR: Stock mismatch! Expected {expectedStock}, got {productAfter.StockQuantity}");
                    }
                }
                else if (rowsAffected == 0)
                {
                    Console.WriteLine($"[REDUCE STOCK] WARNING: Product {item.productId} not found or already deleted!");
                }
            }

            Console.WriteLine($"[REDUCE STOCK] Stock reduction completed for {orderItems.Count} products");
        }

        // Helper method to restore stock for order items
        private async Task RestoreStockForOrderItems(List<(int productId, int quantity)> orderItems)
        {
            foreach (var item in orderItems)
            {
                // Use direct SQL update to ensure stock is actually restored in database
                // This bypasses EF tracking issues and query filters
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    @"UPDATE Products 
                      SET stock_quantity = stock_quantity + {1}
                      WHERE product_id = {0} AND is_deleted = 0",
                    item.productId,
                    item.quantity);

                Console.WriteLine($"[RESTORE STOCK] Restoring {item.quantity} units for product {item.productId}. Rows affected: {rowsAffected}");
                
                if (rowsAffected == 0)
                {
                    Console.WriteLine($"[RESTORE STOCK] WARNING: Product {item.productId} not found or already deleted!");
                }
            }

            Console.WriteLine($"[RESTORE STOCK] Stock restoration completed for {orderItems.Count} products");
        }
    }
}