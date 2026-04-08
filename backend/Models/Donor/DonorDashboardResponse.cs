namespace Lighthouse.Sanctuary.Api.Models.Donor;

public class DonorDashboardResponse
{
    public DonorProfileDto Profile { get; set; } = new();
    public DonorSummaryDto Summary { get; set; } = new();
    public List<DonorMonthlyGivingPointDto> MonthlyGiving { get; set; } = [];
    public List<DonorDonationDto> RecentDonations { get; set; } = [];
    public DonorOrganizationImpactDto OrganizationImpact { get; set; } = new();
    public DonorImpactPredictionDto? ImpactPrediction { get; set; }
}

public class DonorProfileDto
{
    public int SupporterId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string? Region { get; set; }
}

public class DonorSummaryDto
{
    public decimal TotalGiven { get; set; }
    public decimal ThisYear { get; set; }
    public int DonationCount { get; set; }
    public bool HasRecurringGift { get; set; }
    public int CounselingSessionsFunded { get; set; }
    public int MonthsHousingFunded { get; set; }
    public int ResidentsHelpedEstimate { get; set; }
}

public class DonorMonthlyGivingPointDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class DonorDonationDto
{
    public int DonationId { get; set; }
    public string Date { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Campaign { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }
    public string Status { get; set; } = "Completed";
}

public class DonorOrganizationImpactDto
{
    public int ActiveSupporters { get; set; }
    public int ActiveMonetaryDonors { get; set; }
    public int RecurringDonors { get; set; }
    public int DonationEvents { get; set; }
    public decimal TotalContributionValue { get; set; }
    public decimal AverageGiftAmount { get; set; }
    public List<OrganizationMonthlyGivingPointDto> MonthlyTrends { get; set; } = [];
    public List<OrganizationCampaignBreakdownDto> CampaignBreakdown { get; set; } = [];
}

public class OrganizationMonthlyGivingPointDto
{
    public string Month { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int DonorCount { get; set; }
}

public class OrganizationCampaignBreakdownDto
{
    public string Label { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int DonationCount { get; set; }
}

public class DonorImpactPredictionDto
{
    public decimal ImpactScore { get; set; }
    public string PredictedTopProgramArea { get; set; } = string.Empty;
    public decimal PredictedEducationShare { get; set; }
    public string ModelVersion { get; set; } = string.Empty;
    public string ScoredAtUtc { get; set; } = string.Empty;
}
