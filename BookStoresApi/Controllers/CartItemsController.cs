using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStoresApi.Data;
using BookStoresApi.Models;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/cartitems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartItem>>> GetCartItems()
        {
            return await _context.CartItems
                .Include(ci => ci.ShoppingCart)
                .Include(ci => ci.Product)
                .ToListAsync();
        }

        // GET: api/cartitems/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CartItem>> GetCartItem(int id)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.ShoppingCart)
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.CartItemId == id);

            if (cartItem == null)
            {
                return NotFound();
            }

            return cartItem;
        }

        // GET: api/cartitems/cart/{cartId}
        [HttpGet("cart/{cartId}")]
        public async Task<ActionResult<IEnumerable<CartItem>>> GetCartItemsByCart(int cartId)
        {
            return await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();
        }

        // POST: api/cartitems
        [HttpPost]
        public async Task<ActionResult<CartItem>> CreateCartItem(CartItem cartItem)
        {
            // Check if product already exists in cart
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartItem.CartId && ci.ProductId == cartItem.ProductId && !ci.IsDeleted);

            if (existingItem != null)
            {
                // Update quantity instead of creating new item
                existingItem.Quantity += cartItem.Quantity;
                existingItem.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
                return Ok(existingItem);
            }

            // Get current product price
            var product = await _context.Products.FindAsync(cartItem.ProductId);
            if (product == null)
            {
                return BadRequest("Product not found");
            }

            cartItem.PriceAtAddTime = product.Price;
            cartItem.CreatedAt = DateTime.Now;
            cartItem.UpdatedAt = DateTime.Now;

            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCartItem), new { id = cartItem.CartItemId }, cartItem);
        }

        // PUT: api/cartitems/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, CartItem cartItem)
        {
            if (id != cartItem.CartItemId)
            {
                return BadRequest();
            }

            var existingCartItem = await _context.CartItems.FindAsync(id);
            if (existingCartItem == null)
            {
                return NotFound();
            }

            existingCartItem.Quantity = cartItem.Quantity;
            existingCartItem.UpdatedAt = DateTime.Now;
            existingCartItem.UpdatedBy = cartItem.UpdatedBy;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CartItemExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // PUT: api/cartitems/{id}/quantity
        [HttpPut("{id}/quantity")]
        public async Task<IActionResult> UpdateCartItemQuantity(int id, [FromBody] int quantity)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound();
            }

            if (quantity <= 0)
            {
                return BadRequest("Quantity must be greater than 0");
            }

            cartItem.Quantity = quantity;
            cartItem.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/cartitems/{id} (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound();
            }

            // Soft delete
            cartItem.IsDeleted = true;
            cartItem.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CartItemExists(int id)
        {
            return _context.CartItems.Any(e => e.CartItemId == id);
        }
    }
}
