using Lighthouse.Sanctuary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Data;

public class LighthouseContext(DbContextOptions<LighthouseContext> options) : DbContext(options)
{
    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<ProcessRecording> ProcessRecordings => Set<ProcessRecording>();
    public DbSet<HomeVisitation> HomeVisitations => Set<HomeVisitation>();
    public DbSet<EducationRecord> EducationRecords => Set<EducationRecord>();
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords => Set<HealthWellbeingRecord>();
    public DbSet<InterventionPlan> InterventionPlans => Set<InterventionPlan>();
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics => Set<SafehouseMonthlyMetric>();
    public DbSet<MlDonorChurnScore> MlDonorChurnScores => Set<MlDonorChurnScore>();
    public DbSet<MlSocialPostScore> MlSocialPostScores => Set<MlSocialPostScore>();
    public DbSet<MlResidentReadinessScore> MlResidentReadinessScores => Set<MlResidentReadinessScore>();
    public DbSet<MlDonorImpactPrediction> MlDonorImpactPredictions => Set<MlDonorImpactPrediction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Safehouse>().ToTable("safehouses");
        modelBuilder.Entity<Resident>().ToTable("residents");
        modelBuilder.Entity<Supporter>().ToTable("supporters");
        modelBuilder.Entity<Donation>().ToTable("donations");
        modelBuilder.Entity<DonationAllocation>().ToTable("donation_allocations");
        modelBuilder.Entity<SocialMediaPost>().ToTable("social_media_posts");
        modelBuilder.Entity<PublicImpactSnapshot>().ToTable("public_impact_snapshots");
        modelBuilder.Entity<AppUser>().ToTable("app_users");
        modelBuilder.Entity<ProcessRecording>().ToTable("process_recordings");
        modelBuilder.Entity<HomeVisitation>().ToTable("home_visitations");
        modelBuilder.Entity<EducationRecord>().ToTable("education_records");
        modelBuilder.Entity<HealthWellbeingRecord>().ToTable("health_wellbeing_records");
        modelBuilder.Entity<InterventionPlan>().ToTable("intervention_plans");
        modelBuilder.Entity<SafehouseMonthlyMetric>().ToTable("safehouse_monthly_metrics");
        modelBuilder.Entity<MlDonorChurnScore>().ToTable("ml_donor_churn_scores");
        modelBuilder.Entity<MlSocialPostScore>().ToTable("ml_social_post_scores");
        modelBuilder.Entity<MlResidentReadinessScore>().ToTable("ml_resident_readiness_scores");
        modelBuilder.Entity<MlDonorImpactPrediction>().ToTable("ml_donor_impact_predictions");
    }
}
