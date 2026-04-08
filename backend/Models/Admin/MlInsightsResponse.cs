namespace Lighthouse.Sanctuary.Api.Models.Admin;

public class MlInsightsResponse
{
    public string? LastRefreshedAtUtc { get; set; }
    /// <summary>Pipeline 1 (churn) + Pipeline 4 (donor uplift) per supporter.</summary>
    public List<MlDonorPipelineItemDto> DonorPipeline { get; set; } = [];
    public List<MlSocialPostScoreItemDto> SocialPostScores { get; set; } = [];
    public List<MlResidentReadinessItemDto> ResidentReadiness { get; set; } = [];
}

public class MlDonorPipelineItemDto
{
    public int SupporterId { get; set; }
    public string DonorName { get; set; } = string.Empty;
    public decimal? ChurnScore { get; set; }
    public string? ChurnTier { get; set; }
    public string? ChurnModelVersion { get; set; }
    public string? ChurnScoredAtUtc { get; set; }
    public decimal? DonorUpliftScore { get; set; }
    public string? UpliftModelVersion { get; set; }
    public string? UpliftScoredAtUtc { get; set; }
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
