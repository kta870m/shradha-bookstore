using Microsoft.EntityFrameworkCore;
using BookStoresApi.Models;

namespace BookStoresApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<ApplicationUser> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
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
            modelBuilder.Entity<Category>()
                .HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Product - Category
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Media - Product
            modelBuilder.Entity<Media>()
                .HasOne(m => m.Product)
                .WithMany(p => p.MediaFiles)
                .HasForeignKey(m => m.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order - Customer (ApplicationUser)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order - Admin (ApplicationUser)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Admin)
                .WithMany()
                .HasForeignKey(o => o.AdminId)
                .OnDelete(DeleteBehavior.SetNull);

            // OrderDetail - Order
            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // OrderDetail - Product
            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Product)
                .WithMany(p => p.OrderDetails)
                .HasForeignKey(od => od.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // ProductReview - Product
            modelBuilder.Entity<ProductReview>()
                .HasOne(pr => pr.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(pr => pr.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProductReview - Customer
            modelBuilder.Entity<ProductReview>()
                .HasOne(pr => pr.Customer)
                .WithMany()
                .HasForeignKey(pr => pr.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // FeedbackQuery - Customer
            modelBuilder.Entity<FeedbackQuery>()
                .HasOne(fq => fq.Customer)
                .WithMany()
                .HasForeignKey(fq => fq.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // FeedbackQuery - Admin
            modelBuilder.Entity<FeedbackQuery>()
                .HasOne(fq => fq.Admin)
                .WithMany()
                .HasForeignKey(fq => fq.AdminId)
                .OnDelete(DeleteBehavior.SetNull);

            // ShoppingCart - Customer (One-to-One)
            modelBuilder.Entity<ShoppingCart>()
                .HasOne(sc => sc.Customer)
                .WithMany()
                .HasForeignKey(sc => sc.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ShoppingCart>()
                .HasIndex(sc => sc.CustomerId)
                .IsUnique();

            // CartItem - ShoppingCart
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.ShoppingCart)
                .WithMany(sc => sc.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem - Product
            modelBuilder.Entity<CartItem>()
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
        }
    }
}
