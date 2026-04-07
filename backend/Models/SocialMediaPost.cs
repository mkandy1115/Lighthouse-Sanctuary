using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("social_media_posts")]
public class SocialMediaPost
{
    [Key]
    [Column("post_id")]
    public int PostId { get; set; }

    [Column("platform")]
    public string Platform { get; set; } = string.Empty;

    [Column("platform_post_id")]
    public string PlatformPostId { get; set; } = string.Empty;

    [Column("post_url")]
    public string? PostUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("post_type")]
    public string? PostType { get; set; }

    [Column("media_type")]
    public string? MediaType { get; set; }

    [Column("caption")]
    public string? Caption { get; set; }

    [Column("reach")]
    public int? Reach { get; set; }

    [Column("likes")]
    public int? Likes { get; set; }

    [Column("comments")]
    public int? Comments { get; set; }

    [Column("shares")]
    public int? Shares { get; set; }

    [Column("engagement_rate")]
    public decimal? EngagementRate { get; set; }

    [Column("donation_referrals")]
    public int? DonationReferrals { get; set; }

    [Column("estimated_donation_value_php")]
    public decimal? EstimatedDonationValuePhp { get; set; }
}
