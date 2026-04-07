using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lighthouse.Sanctuary.Api.Models;

[Table("health_wellbeing_records")]
public class HealthWellbeingRecord
{
    [Key]
    [Column("health_record_id")]
    public int HealthRecordId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly RecordDate { get; set; }

    [Column("general_health_score")]
    public decimal? GeneralHealthScore { get; set; }

    [Column("nutrition_score")]
    public decimal? NutritionScore { get; set; }

    [Column("sleep_quality_score")]
    public decimal? SleepQualityScore { get; set; }

    [Column("energy_level_score")]
    public decimal? EnergyLevelScore { get; set; }
}
