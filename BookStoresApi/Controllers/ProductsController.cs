using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using BookStoresApi.Data;
using BookStoresApi.Models;

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

        // GET: api/products/new-code
        [HttpGet("new-code")]
        public async Task<IActionResult> GetNewProductCode()
        {
            string newCode = "PR000001"; // default fallback

            var connStr = _configuration.GetConnectionString("DefaultConnection");
            using (var conn = new SqlConnection(connStr))
            {
                string query = @"
                    SELECT ISNULL(
                        (
                            SELECT TOP 1
                                LEFT(product_code, PATINDEX('%[0-9]%', product_code) - 1) +
                                RIGHT('000000' + CAST(CAST(SUBSTRING(product_code, PATINDEX('%[0-9]%', product_code), LEN(product_code)) AS INT) + 1 AS VARCHAR), 6)
                            FROM Products
                            WHERE
                                product_code LIKE '[A-Za-z]%' AND
                                PATINDEX('%[0-9]%', product_code) > 0 AND
                                ISNUMERIC(SUBSTRING(product_code, PATINDEX('%[0-9]%', product_code), LEN(product_code))) = 1
                            ORDER BY
                                CAST(SUBSTRING(product_code, PATINDEX('%[0-9]%', product_code), LEN(product_code)) AS INT) DESC
                        ),
                        'PR000001'
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

            return Ok(new { productCode = newCode });
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.MediaFiles)
                .ToListAsync();
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
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
            return await _context.Products
                .Include(p => p.Category)
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
                var codeResult = await GetNewProductCode();
                var codeValue = (codeResult as OkObjectResult)?.Value;
                var codeProperty = codeValue?.GetType().GetProperty("productCode");
                product.ProductCode = codeProperty?.GetValue(codeValue)?.ToString() ?? "PR000001";
            }

            product.CreatedAt = DateTime.Now;
            product.UpdatedAt = DateTime.Now;

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
            existingProduct.UpdatedAt = DateTime.Now;
            existingProduct.UpdatedBy = product.UpdatedBy;

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
            product.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductId == id);
        }
    }
}
