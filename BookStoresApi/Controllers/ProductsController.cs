using BookStoresApi.Data;
using BookStoresApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;

        public ProductsController(
            ApplicationDbContext context,
            IConfiguration configuration,
            IMemoryCache cache
        )
        {
            _context = context;
            _configuration = configuration;
            _cache = cache;
        }

        // GET: api/products/new-code?productType=Book
        [HttpGet("new-code")]
        public async Task<IActionResult> GetNewProductCode([FromQuery] string productType)
        {
            // Determine prefix based on product type
            string prefix;
            string defaultCode;

            switch (productType?.ToLower())
            {
                case "book":
                    prefix = "BK";
                    defaultCode = "BK000001";
                    break;
                case "ebook":
                    prefix = "EB";
                    defaultCode = "EB000001";
                    break;
                case "audiobook":
                    prefix = "AB";
                    defaultCode = "AB000001";
                    break;
                case "magazine":
                    prefix = "MG";
                    defaultCode = "MG000001";
                    break;
                case "stationery":
                    prefix = "ST";
                    defaultCode = "ST000001";
                    break;
                default:
                    prefix = "PR";
                    defaultCode = "PR000001";
                    break;
            }

            string newCode = defaultCode;

            var connStr = _configuration.GetConnectionString("DefaultConnection");
            using (var conn = new SqlConnection(connStr))
            {
                string query =
                    @"
                    SELECT ISNULL(
                        (
                            SELECT TOP 1
                                LEFT(product_code, PATINDEX('%[0-9]%', product_code) - 1) +
                                RIGHT('000000' + CAST(CAST(SUBSTRING(product_code, PATINDEX('%[0-9]%', product_code), LEN(product_code)) AS INT) + 1 AS VARCHAR), 6)
                            FROM Products
                            WHERE
                                product_code LIKE @Prefix + '%' AND
                                PATINDEX('%[0-9]%', product_code) > 0 AND
                                ISNUMERIC(SUBSTRING(product_code, PATINDEX('%[0-9]%', product_code), LEN(product_code))) = 1
                            ORDER BY
                                CAST(SUBSTRING(product_code, PATINDEX('%[0-9]%', product_code), LEN(product_code)) AS INT) DESC
                        ),
                        @DefaultCode
                    ) AS NewCode;
                ";

                using (var cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Prefix", prefix);
                    cmd.Parameters.AddWithValue("@DefaultCode", defaultCode);

                    await conn.OpenAsync();
                    var result = await cmd.ExecuteScalarAsync();
                    if (result != null && result != DBNull.Value)
                    {
                        newCode = result.ToString() ?? defaultCode;
                    }
                }
            }

            return Ok(new { productCode = newCode });
        }

        // GET: api/products?page=1&pageSize=20&search=keyword&categoryId=1
        [HttpGet]
        public async Task<ActionResult<object>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? sortBy = "productName",
            [FromQuery] bool ascending = true
        )
        {
            var query = _context.Products.Where(p => !p.IsDeleted).AsQueryable();

            // Filter by search
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    p.ProductName.Contains(search)
                    || p.ProductCode.Contains(search)
                    || (p.Description != null && p.Description.Contains(search))
                );
            }

            // Filter by category
            if (categoryId.HasValue)
            {
                query = query.Where(p =>
                    p.ProductCategories.Any(pc => pc.CategoryId == categoryId.Value)
                );
            }

            // Get total count before pagination
            var totalItems = await query.CountAsync();

            // Sorting
            query = sortBy?.ToLower() switch
            {
                "price" => ascending
                    ? query.OrderBy(p => p.Price)
                    : query.OrderByDescending(p => p.Price),
                "date" => ascending
                    ? query.OrderBy(p => p.ReleaseDate)
                    : query.OrderByDescending(p => p.ReleaseDate),
                "stock" => ascending
                    ? query.OrderBy(p => p.StockQuantity)
                    : query.OrderByDescending(p => p.StockQuantity),
                "rating" => ascending
                    ? query.OrderBy(p => p.AverageRating)
                    : query.OrderByDescending(p => p.AverageRating),
                _ => ascending
                    ? query.OrderBy(p => p.ProductName)
                    : query.OrderByDescending(p => p.ProductName),
            };

            // Pagination with projection
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.ProductId,
                    p.ProductCode,
                    p.ProductName,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    p.AverageRating,
                    p.TotalReviews,
                    p.ProductType,
                    p.Manufacturer,
                    p.ReleaseDate,
                    ThumbnailUrl = p
                        .MediaFiles.Where(m => !m.IsDeleted).OrderBy(m => m.MediaId)
                        .Select(m => m.MediaUrl)
                        .FirstOrDefault(),
                    Categories = p
                        .ProductCategories.Select(pc => new
                        {
                            pc.Category.CategoryId,
                            pc.Category.CategoryName,
                        })
                        .ToList(),
                })
                .ToListAsync();

            return Ok(
                new
                {
                    items = products,
                    totalItems,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                }
            );
        }

        // GET: api/products/featured?limit=12
        [HttpGet("featured")]
        [ResponseCache(Duration = 300)] // Cache 5 minutes
        public async Task<ActionResult<IEnumerable<object>>> GetFeaturedProducts(
            [FromQuery] int limit = 12
        )
        {
            var cacheKey = $"featured_products_{limit}";

            if (!_cache.TryGetValue(cacheKey, out List<object>? products))
            {
                var productList = await _context
                    .Products.Where(p => !p.IsDeleted && p.StockQuantity > 0)
                    .OrderByDescending(p => p.AverageRating)
                    .ThenByDescending(p => p.TotalReviews)
                    .Take(limit)
                    .Select(p => new
                    {
                        p.ProductId,
                        p.ProductName,
                        p.Price,
                        p.AverageRating,
                        p.TotalReviews,
                        p.StockQuantity,
                        ThumbnailUrl = p
                            .MediaFiles.OrderBy(m => m.MediaId)
                            .Select(m => m.MediaUrl)
                            .FirstOrDefault(),
                        MainCategory = p
                            .ProductCategories.Select(pc => pc.Category.CategoryName)
                            .FirstOrDefault(),
                    })
                    .ToListAsync();

                products = productList.Cast<object>().ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

                _cache.Set(cacheKey, products, cacheOptions);
            }

            return Ok(products);
        }

        // GET: api/products/search?q=keyword&limit=20
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchProducts(
            [FromQuery] string? q = null,
            [FromQuery] int limit = 20
        )
        {
            var query = _context.Products
                .Where(p => !p.IsDeleted && p.StockQuantity > 0);

            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(p => 
                    p.ProductName.Contains(q) || 
                    p.ProductCode.Contains(q) ||
                    (p.Description != null && p.Description.Contains(q)) ||
                    (p.Manufacturer != null && p.Manufacturer.Contains(q))
                );
            }

            var products = await query
                .OrderBy(p => p.ProductName)
                .Take(limit)
                .Select(p => new
                {
                    p.ProductId,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.StockQuantity,
                    ThumbnailUrl = p.MediaFiles
                        .Where(m => !m.IsDeleted)
                        .OrderBy(m => m.MediaId)
                        .Select(m => m.MediaUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/new-arrivals?limit=12
        [HttpGet("new-arrivals")]
        [ResponseCache(Duration = 300)] // Cache 5 minutes
        public async Task<ActionResult<IEnumerable<object>>> GetNewArrivals(
            [FromQuery] int limit = 12
        )
        {
            var cacheKey = $"new_arrivals_{limit}";

            if (!_cache.TryGetValue(cacheKey, out List<object>? products))
            {
                var productList = await _context
                    .Products.Where(p => !p.IsDeleted && p.StockQuantity > 0)
                    .OrderByDescending(p => p.ReleaseDate ?? DateTime.MinValue)
                    .Take(limit)
                    .Select(p => new
                    {
                        p.ProductId,
                        p.ProductName,
                        p.Price,
                        p.AverageRating,
                        p.ReleaseDate,
                        p.StockQuantity,
                        ThumbnailUrl = p
                            .MediaFiles.Where(m => !m.IsDeleted).OrderBy(m => m.MediaId)
                            .Select(m => m.MediaUrl)
                            .FirstOrDefault(),
                        MainCategory = p
                            .ProductCategories.Select(pc => pc.Category.CategoryName)
                            .FirstOrDefault(),
                    })
                    .ToListAsync();

                products = productList.Cast<object>().ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

                _cache.Set(cacheKey, products, cacheOptions);
            }

            return Ok(products);
        }

        // GET: api/products/best-sellers?limit=12
        [HttpGet("best-sellers")]
        [ResponseCache(Duration = 300)] // Cache 5 minutes
        public async Task<ActionResult<IEnumerable<object>>> GetBestSellers(
            [FromQuery] int limit = 12
        )
        {
            var cacheKey = $"best_sellers_{limit}";

            if (!_cache.TryGetValue(cacheKey, out List<object>? products))
            {
                var productList = await _context
                    .Products.Where(p => !p.IsDeleted && p.StockQuantity > 0)
                    .OrderByDescending(p => p.TotalReviews)
                    .ThenByDescending(p => p.AverageRating)
                    .Take(limit)
                    .Select(p => new
                    {
                        p.ProductId,
                        p.ProductName,
                        p.Price,
                        p.AverageRating,
                        p.TotalReviews,
                        p.StockQuantity,
                        ThumbnailUrl = p
                            .MediaFiles.OrderBy(m => m.MediaId)
                            .Select(m => m.MediaUrl)
                            .FirstOrDefault(),
                        MainCategory = p
                            .ProductCategories.Select(pc => pc.Category.CategoryName)
                            .FirstOrDefault(),
                    })
                    .ToListAsync();

                products = productList.Cast<object>().ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

                _cache.Set(cacheKey, products, cacheOptions);
            }

            return Ok(products);
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetProduct(int id)
        {
            // Sử dụng IgnoreQueryFilters để có thể lấy product cho edit (admin)
            var product = await _context
                .Products.IgnoreQueryFilters()
                .Include(p => p.ProductCategories)
                .ThenInclude(pc => pc.Category)
                .Include(p => p.MediaFiles.Where(m => !m.IsDeleted))
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound();
            }

            Console.WriteLine($"[PRODUCTS] Product {id} has {product.MediaFiles?.Count ?? 0} active media files");

            // Trả về với thông tin đầy đủ cho customer
            var primaryCategory = product.ProductCategories.FirstOrDefault()?.Category;
            
            var result = new
            {
                product.ProductId,
                product.ProductCode,
                product.ProductName,
                product.Description,
                product.Price,
                product.Manufacturer,
                product.ProductType,
                product.ReleaseDate,
                product.StockQuantity,
                product.AverageRating,
                product.TotalReviews,
                product.IsDeleted,
                MediaFiles = product.MediaFiles.Select(m => new
                {
                    m.MediaId,
                    m.MediaUrl,
                    m.MediaType
                }).ToList(),
                CategoryId = primaryCategory?.CategoryId,
                CategoryName = primaryCategory?.CategoryName,
                // Thêm các thông tin mở rộng (có thể lấy từ Description hoặc fields khác)
                Author = product.Manufacturer, // Tạm dùng Manufacturer làm Author
                Publisher = product.Manufacturer,
                Isbn = product.ProductCode,
                PublicationDate = product.ReleaseDate?.ToString("yyyy")
            };

            return Ok(result);
        }

        // GET: api/products/by-category/{categoryId}
        [HttpGet("by-category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetProductsByCategory(
            int categoryId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 12)
        {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 12;
            if (pageSize > 100) pageSize = 100; // Max 100 items per page

            var products = await _context
                .ProductCategories
                .Where(pc => pc.CategoryId == categoryId && !pc.Product.IsDeleted)
                .Select(pc => new
                {
                    pc.Product.ProductId,
                    pc.Product.ProductName,
                    pc.Product.Price,
                    pc.Product.Manufacturer,
                    pc.Product.AverageRating,
                    pc.Product.StockQuantity,
                    MediaFiles = pc.Product.MediaFiles
                        .Where(m => !m.IsDeleted)
                        .Select(m => new
                        {
                            m.MediaId,
                            m.MediaUrl,
                            m.MediaType
                        })
                        .ToList()
                })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            // Auto-generate product code if not provided
            if (string.IsNullOrEmpty(product.ProductCode))
            {
                var codeResult = await GetNewProductCode(product.ProductType);
                var codeValue = (codeResult as OkObjectResult)?.Value;
                var codeProperty = codeValue?.GetType().GetProperty("productCode");
                product.ProductCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "PR000001";
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            Console.WriteLine($"[UPDATE] Attempting to update product with ID: {id}");
            Console.WriteLine($"[UPDATE] Product data received: {System.Text.Json.JsonSerializer.Serialize(product)}");
            
            if (id != product.ProductId)
            {
                Console.WriteLine($"[UPDATE] ID mismatch: URL ID {id} != Product ID {product.ProductId}");
                return BadRequest("ID mismatch");
            }

            // Sử dụng IgnoreQueryFilters để tìm product kể cả khi IsDeleted = true
            var existingProduct = await _context.Products
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.ProductId == id);
                
            if (existingProduct == null)
            {
                Console.WriteLine($"[UPDATE] Product with ID {id} not found");
                return NotFound();
            }

            Console.WriteLine($"[UPDATE] Found existing product: {existingProduct.ProductName} (IsDeleted: {existingProduct.IsDeleted})");

            // Không cho phép edit product đã bị xóa
            if (existingProduct.IsDeleted)
            {
                Console.WriteLine($"[UPDATE] Cannot edit deleted product {id}");
                return BadRequest("Cannot edit deleted product");
            }

            Console.WriteLine($"[UPDATE] Using direct SQL update to bypass EF tracking issues...");
            
            try
            {
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(@"
                    UPDATE Products 
                    SET product_code = {0}, 
                        product_name = {1}, 
                        description = {2}, 
                        price = {3}, 
                        manufacturer = {4}, 
                        product_type = {5}, 
                        release_date = {6}, 
                        stock_quantity = {7}
                    WHERE product_id = {8}",
                    product.ProductCode,
                    product.ProductName,
                    product.Description ?? (object)DBNull.Value,
                    product.Price,
                    product.Manufacturer ?? (object)DBNull.Value,
                    product.ProductType,
                    product.ReleaseDate?.ToString("yyyy-MM-dd") ?? (object)DBNull.Value,
                    product.StockQuantity,
                    id);
                
                Console.WriteLine($"[UPDATE] Direct SQL update completed. Rows affected: {rowsAffected}");
                
                if (rowsAffected == 0)
                {
                    Console.WriteLine($"[UPDATE] Warning: No rows were updated in database");
                    return NotFound();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UPDATE] Exception during direct SQL update: {ex.Message}");
                Console.WriteLine($"[UPDATE] Stack trace: {ex.StackTrace}");
                throw;
            }

            Console.WriteLine($"[UPDATE] Product {id} updated successfully");
            return NoContent();
        }

        // DELETE: api/products/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            Console.WriteLine($"[DELETE] Attempting to delete product with ID: {id}");
            
            // Sử dụng IgnoreQueryFilters để tìm product kể cả khi IsDeleted = true
            var product = await _context.Products
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.ProductId == id);
                
            if (product == null)
            {
                Console.WriteLine($"[DELETE] Product with ID {id} not found");
                return NotFound();
            }

            Console.WriteLine($"[DELETE] Found product: {product.ProductName} (IsDeleted: {product.IsDeleted})");

            // Kiểm tra nếu đã bị xóa
            if (product.IsDeleted)
            {
                Console.WriteLine($"[DELETE] Product {id} is already deleted");
                return NoContent(); // Trả về thành công vì sản phẩm đã bị xóa rồi
            }

            // Soft delete bằng cách update trực tiếp
            Console.WriteLine($"[DELETE] Setting IsDeleted = true for product {id}");
            
            var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                "UPDATE Products SET is_deleted = 1 WHERE product_id = {0}",
                id);
                
            Console.WriteLine($"[DELETE] Direct SQL update completed. Rows affected: {rowsAffected}");

            if (rowsAffected == 0)
            {
                Console.WriteLine($"[DELETE] No rows were updated for product {id}");
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/products/{productId}/categories/{categoryId}
        [HttpPost("{productId}/categories/{categoryId}")]
        public async Task<IActionResult> AddCategoryToProduct(int productId, int categoryId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return NotFound("Product not found");
            }

            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
            {
                return NotFound("Category not found");
            }

            // Check if relationship already exists
            var exists = await _context.ProductCategories.AnyAsync(pc =>
                pc.ProductId == productId && pc.CategoryId == categoryId
            );

            if (exists)
            {
                return BadRequest("Product already has this category");
            }

            var productCategory = new ProductCategory
            {
                ProductId = productId,
                CategoryId = categoryId,
            };

            _context.ProductCategories.Add(productCategory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category added to product successfully" });
        }

        // DELETE: api/products/{productId}/categories/{categoryId}
        [HttpDelete("{productId}/categories/{categoryId}")]
        public async Task<IActionResult> RemoveCategoryFromProduct(int productId, int categoryId)
        {
            var productCategory = await _context.ProductCategories.FirstOrDefaultAsync(pc =>
                pc.ProductId == productId && pc.CategoryId == categoryId
            );

            if (productCategory == null)
            {
                return NotFound("Product-Category relationship not found");
            }

            _context.ProductCategories.Remove(productCategory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category removed from product successfully" });
        }

        // GET: api/products/{productId}/categories
        [HttpGet("{productId}/categories")]
        public async Task<ActionResult<IEnumerable<Category>>> GetProductCategories(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return NotFound("Product not found");
            }

            var categories = await _context
                .ProductCategories.Where(pc => pc.ProductId == productId)
                .Include(pc => pc.Category)
                .Select(pc => pc.Category)
                .ToListAsync();

            return Ok(categories);
        }

        // PUT: api/products/{productId}/categories
        // Update all categories for a product at once
        [HttpPut("{productId}/categories")]
        public async Task<IActionResult> UpdateProductCategories(
            int productId,
            [FromBody] int[] categoryIds
        )
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return NotFound("Product not found");
            }

            // Verify all categories exist
            foreach (var categoryId in categoryIds)
            {
                var categoryExists = await _context.Categories.AnyAsync(c =>
                    c.CategoryId == categoryId
                );
                if (!categoryExists)
                {
                    return BadRequest($"Category with ID {categoryId} not found");
                }
            }

            // Remove all existing categories
            var existingProductCategories = await _context
                .ProductCategories.Where(pc => pc.ProductId == productId)
                .ToListAsync();
            _context.ProductCategories.RemoveRange(existingProductCategories);

            // Add new categories
            foreach (var categoryId in categoryIds)
            {
                var productCategory = new ProductCategory
                {
                    ProductId = productId,
                    CategoryId = categoryId,
                };
                _context.ProductCategories.Add(productCategory);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product categories updated successfully" });
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductId == id);
        }
    }
}
