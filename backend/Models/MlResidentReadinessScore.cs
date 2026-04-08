using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("ml_resident_readiness_scores")]
public class MlResidentReadinessScore
{
    [Key]
    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("readiness_score")]
    public decimal ReadinessScore { get; set; }

    [Column("readiness_tier")]
    public string ReadinessTier { get; set; } = "Developing";

    [Column("model_version")]
    public string ModelVersion { get; set; } = "pipeline3-v1";

    [Column("scored_at_utc")]
    public DateTime ScoredAtUtc { get; set; }
}
