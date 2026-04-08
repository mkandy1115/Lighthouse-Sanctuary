using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("ml_donor_impact_predictions")]
public class MlDonorImpactPrediction
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("impact_score")]
    public decimal ImpactScore { get; set; }

    [Column("predicted_top_program_area")]
    public string PredictedTopProgramArea { get; set; } = "Education";

    [Column("predicted_education_share")]
    public decimal PredictedEducationShare { get; set; }

    [Column("model_version")]
    public string ModelVersion { get; set; } = "pipeline5-v1";

    [Column("scored_at_utc")]
    public DateTime ScoredAtUtc { get; set; }
}
