using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("ml_donor_churn_scores")]
public class MlDonorChurnScore
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("churn_score")]
    public decimal ChurnScore { get; set; }

    [Column("churn_tier")]
    public string ChurnTier { get; set; } = "Medium";

    [Column("model_version")]
    public string ModelVersion { get; set; } = "pipeline1-v1";

    [Column("scored_at_utc")]
    public DateTime ScoredAtUtc { get; set; }
}
