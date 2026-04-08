using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("ml_donor_uplift_scores")]
public class MlDonorUpliftScore
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("uplift_score")]
    public decimal UpliftScore { get; set; }

    [Column("model_version")]
    public string ModelVersion { get; set; } = "pipeline4-v1";

    [Column("scored_at_utc")]
    public DateTime ScoredAtUtc { get; set; }
}
