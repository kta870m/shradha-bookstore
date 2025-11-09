using BookStoresApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BookStoresApi.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        // DbSets
        // Users DbSet is inherited from IdentityDbContext
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<ProductReview> ProductReviews { get; set; }
        public DbSet<FeedbackQuery> FeedbackQueries { get; set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Category - Self Reference
            modelBuilder
                .Entity<Category>()
                .HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // ProductCategory - Product (Many-to-Many)
            modelBuilder
                .Entity<ProductCategory>()
                .HasOne(pc => pc.Product)
                .WithMany(p => p.ProductCategories)
                .HasForeignKey(pc => pc.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProductCategory - Category (Many-to-Many)
            modelBuilder
                .Entity<ProductCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.ProductCategories)
                .HasForeignKey(pc => pc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Composite unique index to prevent duplicate product-category combinations
            modelBuilder
                .Entity<ProductCategory>()
                .HasIndex(pc => new { pc.ProductId, pc.CategoryId })
                .IsUnique();

            // Media - Product
            modelBuilder
                .Entity<Media>()
                .HasOne(m => m.Product)
                .WithMany(p => p.MediaFiles)
                .HasForeignKey(m => m.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order - User
            modelBuilder
                .Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // OrderDetail - Order
            modelBuilder
                .Entity<OrderDetail>()
                .HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // OrderDetail - Product
            modelBuilder
                .Entity<OrderDetail>()
                .HasOne(od => od.Product)
                .WithMany(p => p.OrderDetails)
                .HasForeignKey(od => od.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // ProductReview - Product
            modelBuilder
                .Entity<ProductReview>()
                .HasOne(pr => pr.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(pr => pr.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProductReview - User
            modelBuilder
                .Entity<ProductReview>()
                .HasOne(pr => pr.User)
                .WithMany(u => u.ProductReviews)
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // FeedbackQuery - User
            modelBuilder
                .Entity<FeedbackQuery>()
                .HasOne(fq => fq.User)
                .WithMany(u => u.FeedbackQueries)
                .HasForeignKey(fq => fq.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ShoppingCart - User (One-to-One)
            modelBuilder
                .Entity<ShoppingCart>()
                .HasOne(sc => sc.User)
                .WithOne(u => u.ShoppingCart)
                .HasForeignKey<ShoppingCart>(sc => sc.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ShoppingCart>().HasIndex(sc => sc.UserId).IsUnique();

            // CartItem - ShoppingCart
            modelBuilder
                .Entity<CartItem>()
                .HasOne(ci => ci.ShoppingCart)
                .WithMany(sc => sc.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem - Product
            modelBuilder
                .Entity<CartItem>()
                .HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Global query filter for soft delete
            modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Media>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Order>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<OrderDetail>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ProductReview>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<FeedbackQuery>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ShoppingCart>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<CartItem>().HasQueryFilter(e => !e.IsDeleted);

            // Add indexes for better performance
            modelBuilder.Entity<Product>().HasIndex(p => p.ProductCode);

            modelBuilder.Entity<Product>().HasIndex(p => p.ProductName);

            modelBuilder.Entity<Product>().HasIndex(p => p.Price);

            modelBuilder.Entity<Product>().HasIndex(p => p.IsDeleted);

            modelBuilder.Entity<Product>().HasIndex(p => p.ReleaseDate);

            modelBuilder.Entity<Product>().HasIndex(p => p.StockQuantity);

            modelBuilder.Entity<Product>().HasIndex(p => new { p.AverageRating, p.TotalReviews });

            modelBuilder.Entity<ProductCategory>().HasIndex(pc => pc.ProductId);

            modelBuilder.Entity<ProductCategory>().HasIndex(pc => pc.CategoryId);

            modelBuilder.Entity<Media>().HasIndex(m => m.ProductId);
        }
    }
}
