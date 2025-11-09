using BookStoresApi.Data;
using BookStoresApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public ProductsController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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
                        newCode = result.ToString();
                    }
                }
            }

            return Ok(new { productCode = newCode });
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context
                .Products.Include(p => p.Category)
                .Include(p => p.MediaFiles)
                .ToListAsync();
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context
                .Products.Include(p => p.Category)
                .Include(p => p.MediaFiles)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // GET: api/products/by-category/{categoryId}
        [HttpGet("by-category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(int categoryId)
        {
            return await _context
                .Products.Include(p => p.Category)
                .Include(p => p.MediaFiles)
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
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
            if (id != product.ProductId)
            {
                return BadRequest();
            }

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            existingProduct.ProductCode = product.ProductCode;
            existingProduct.ProductName = product.ProductName;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.Manufacturer = product.Manufacturer;
            existingProduct.ProductType = product.ProductType;
            existingProduct.CategoryId = product.CategoryId;
            existingProduct.ReleaseDate = product.ReleaseDate;
            existingProduct.StockQuantity = product.StockQuantity;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/products/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            // Soft delete
            product.IsDeleted = true;
            await _context.SaveChangesAsync();

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
            var exists = await _context.ProductCategories
                .AnyAsync(pc => pc.ProductId == productId && pc.CategoryId == categoryId);

            if (exists)
            {
                return BadRequest("Product already has this category");
            }

            var productCategory = new ProductCategory
            {
                ProductId = productId,
                CategoryId = categoryId
            };

            _context.ProductCategories.Add(productCategory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category added to product successfully" });
        }

        // DELETE: api/products/{productId}/categories/{categoryId}
        [HttpDelete("{productId}/categories/{categoryId}")]
        public async Task<IActionResult> RemoveCategoryFromProduct(int productId, int categoryId)
        {
            var productCategory = await _context.ProductCategories
                .FirstOrDefaultAsync(pc => pc.ProductId == productId && pc.CategoryId == categoryId);

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

            var categories = await _context.ProductCategories
                .Where(pc => pc.ProductId == productId)
                .Include(pc => pc.Category)
                .Select(pc => pc.Category)
                .ToListAsync();

            return Ok(categories);
        }

        // PUT: api/products/{productId}/categories
        // Update all categories for a product at once
        [HttpPut("{productId}/categories")]
        public async Task<IActionResult> UpdateProductCategories(int productId, [FromBody] int[] categoryIds)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return NotFound("Product not found");
            }

            // Verify all categories exist
            foreach (var categoryId in categoryIds)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == categoryId);
                if (!categoryExists)
                {
                    return BadRequest($"Category with ID {categoryId} not found");
                }
            }

            // Remove all existing categories
            var existingProductCategories = await _context.ProductCategories
                .Where(pc => pc.ProductId == productId)
                .ToListAsync();
            _context.ProductCategories.RemoveRange(existingProductCategories);

            // Add new categories
            foreach (var categoryId in categoryIds)
            {
                var productCategory = new ProductCategory
                {
                    ProductId = productId,
                    CategoryId = categoryId
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
