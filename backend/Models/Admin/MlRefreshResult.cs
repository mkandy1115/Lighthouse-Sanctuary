namespace Lighthouse.Sanctuary.Api.Models.Admin;

public class MlRefreshResult
{
    public string RefreshedAtUtc { get; set; } = string.Empty;
    public int DonorChurnUpdated { get; set; }
    public int SocialPostScoresUpdated { get; set; }
    public int ResidentReadinessUpdated { get; set; }
    public int DonorImpactUpdated { get; set; }
}
