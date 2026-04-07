using Lighthouse.Sanctuary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Data;

public class LighthouseContext(DbContextOptions<LighthouseContext> options) : DbContext(options)
{
    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Safehouse>().ToTable("safehouses");
        modelBuilder.Entity<Resident>().ToTable("residents");
        modelBuilder.Entity<Supporter>().ToTable("supporters");
        modelBuilder.Entity<Donation>().ToTable("donations");
        modelBuilder.Entity<SocialMediaPost>().ToTable("social_media_posts");
        modelBuilder.Entity<PublicImpactSnapshot>().ToTable("public_impact_snapshots");
    }
}
