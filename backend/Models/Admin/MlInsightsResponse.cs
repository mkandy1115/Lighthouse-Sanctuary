namespace Lighthouse.Sanctuary.Api.Models.Admin;

public class MlInsightsResponse
{
    public string? LastRefreshedAtUtc { get; set; }
    public List<MlDonorRiskItemDto> DonorRisks { get; set; } = [];
    public List<MlSocialPostScoreItemDto> SocialPostScores { get; set; } = [];
    public List<MlResidentReadinessItemDto> ResidentReadiness { get; set; } = [];
}

public class MlDonorRiskItemDto
{
    public int SupporterId { get; set; }
    public string DonorName { get; set; } = string.Empty;
    public decimal ChurnScore { get; set; }
    public string ChurnTier { get; set; } = "Medium";
    public string ModelVersion { get; set; } = string.Empty;
    public string ScoredAtUtc { get; set; } = string.Empty;
}

public class MlSocialPostScoreItemDto
{
    public int PostId { get; set; }
    public string Platform { get; set; } = string.Empty;
    public string? PostType { get; set; }
    public string? Caption { get; set; }
    public decimal ChurnScore { get; set; }
    public decimal UpliftScore { get; set; }
    public string ModelVersion { get; set; } = string.Empty;
    public string ScoredAtUtc { get; set; } = string.Empty;
}

public class MlResidentReadinessItemDto
{
    public int ResidentId { get; set; }
    public string CaseControlNo { get; set; } = string.Empty;
    public string InternalCode { get; set; } = string.Empty;
    public decimal ReadinessScore { get; set; }
    public string ReadinessTier { get; set; } = "Developing";
    public string ModelVersion { get; set; } = string.Empty;
    public string ScoredAtUtc { get; set; } = string.Empty;
}
