using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Data;
using BookStoresApi.Models;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShoppingCartsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ShoppingCartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/shoppingcarts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShoppingCart>>> GetShoppingCarts()
        {
            return await _context.ShoppingCarts
                .Include(sc => sc.User)
                .Include(sc => sc.CartItems)
                    .ThenInclude(ci => ci.Product)
                .ToListAsync();
        }

        // GET: api/shoppingcarts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ShoppingCart>> GetShoppingCart(int id)
        {
            var shoppingCart = await _context.ShoppingCarts
                .Include(sc => sc.User)
                .Include(sc => sc.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(sc => sc.CartId == id);

            if (shoppingCart == null)
            {
                return NotFound();
            }

            return shoppingCart;
        }

        // GET: api/shoppingcarts/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<ShoppingCart>> GetCartByUser(int userId)
        {
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                // Create new cart if doesn't exist
                var newCart = new ShoppingCart
                {
                    UserId = userId,
                    Status = "Active"
                };
                _context.ShoppingCarts.Add(newCart);
                await _context.SaveChangesAsync();
                return newCart;
            }

            return cart;
        }

        // POST: api/shoppingcarts
        [HttpPost]
        public async Task<ActionResult<ShoppingCart>> CreateShoppingCart(ShoppingCart shoppingCart)
        {
            // Check if user already has a cart
            var existingCart = await _context.ShoppingCarts
                .FirstOrDefaultAsync(sc => sc.UserId == shoppingCart.UserId);

            if (existingCart != null)
            {
                return BadRequest("User already has a shopping cart");
            }

            shoppingCart.Status = "Active";

            _context.ShoppingCarts.Add(shoppingCart);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShoppingCart), new { id = shoppingCart.CartId }, shoppingCart);
        }

        // PUT: api/shoppingcarts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShoppingCart(int id, ShoppingCart shoppingCart)
        {
            if (id != shoppingCart.CartId)
            {
                return BadRequest();
            }

            var existingCart = await _context.ShoppingCarts.FindAsync(id);
            if (existingCart == null)
            {
                return NotFound();
            }

            existingCart.Status = shoppingCart.Status;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ShoppingCartExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/shoppingcarts/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShoppingCart(int id)
        {
            var shoppingCart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .FirstOrDefaultAsync(sc => sc.CartId == id);

            if (shoppingCart == null)
            {
                return NotFound();
            }

            // Soft delete cart and its items
            shoppingCart.IsDeleted = true;

            if (shoppingCart.CartItems != null)
            {
                foreach (var item in shoppingCart.CartItems)
                {
                    item.IsDeleted = true;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/shoppingcarts/{id}/clear
        [HttpPost("{id}/clear")]
        public async Task<IActionResult> ClearCart(int id)
        {
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .FirstOrDefaultAsync(sc => sc.CartId == id);

            if (cart == null)
            {
                return NotFound();
            }

            // Soft delete all items
            foreach (var item in cart.CartItems)
            {
                item.IsDeleted = true;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ShoppingCartExists(int id)
        {
            return _context.ShoppingCarts.Any(e => e.CartId == id);
        }
    }
}
