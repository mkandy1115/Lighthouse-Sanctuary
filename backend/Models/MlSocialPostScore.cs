using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("ml_social_post_scores")]
public class MlSocialPostScore
{
    [Key]
    [Column("post_id")]
    public int PostId { get; set; }

    [Column("churn_score")]
    public decimal ChurnScore { get; set; }

    [Column("uplift_score")]
    public decimal UpliftScore { get; set; }

    [Column("model_version")]
    public string ModelVersion { get; set; } = "pipeline2-4-v1";

    [Column("scored_at_utc")]
    public DateTime ScoredAtUtc { get; set; }
}
