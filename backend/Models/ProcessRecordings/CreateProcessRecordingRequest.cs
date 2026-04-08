using System.ComponentModel.DataAnnotations;

namespace Lighthouse.Sanctuary.Api.Models.ProcessRecordings;

public class CreateProcessRecordingRequest
{
    [Range(1, int.MaxValue)]
    public int ResidentId { get; set; }
    public DateOnly SessionDate { get; set; }

    [StringLength(120)]
    public string? SocialWorker { get; set; }

    [StringLength(24)]
    public string? SessionType { get; set; }

    [Range(1, 720)]
    public int? SessionDurationMinutes { get; set; }

    [StringLength(32)]
    public string? EmotionalStateObserved { get; set; }

    [StringLength(32)]
    public string? EmotionalStateEnd { get; set; }

    [StringLength(4000)]
    public string? SessionNarrative { get; set; }

    [StringLength(2000)]
    public string? InterventionsApplied { get; set; }

    [StringLength(2000)]
    public string? FollowUpActions { get; set; }
    public bool ProgressNoted { get; set; }
    public bool ConcernsFlagged { get; set; }
    public bool ReferralMade { get; set; }
}
