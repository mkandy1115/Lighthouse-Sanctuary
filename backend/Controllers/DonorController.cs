using System.Globalization;
using System.Security.Claims;
using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models.Donor;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/donor")]
[Authorize(Roles = "Donor")]
public class DonorController(LighthouseContext context) : ControllerBase
{
    [HttpPost("donations")]
    public async Task<IActionResult> CreateDonation([FromBody] CreateDonorDonationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        request.CampaignName = InputSanitizer.NormalizePlainText(request.CampaignName, 120);

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Donation amount must be greater than zero." });
        }

        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await context.AppUsers
            .FirstOrDefaultAsync(appUser => appUser.AppUserId == userId && appUser.IsActive);

        if (user is null || !user.SupporterId.HasValue)
        {
            return NotFound(new { message = "No donor profile is linked to this account." });
        }

        var supporterExists = await context.Supporters
            .AnyAsync(record => record.SupporterId == user.SupporterId.Value);

        if (!supporterExists)
        {
            return NotFound(new { message = "Donor record could not be found." });
        }

        var donation = new Models.Donation
        {
            SupporterId = user.SupporterId.Value,
            DonationType = "Monetary",
            DonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = request.IsRecurring,
            CampaignName = string.IsNullOrWhiteSpace(request.CampaignName) ? null : request.CampaignName.Trim(),
            ChannelSource = "Direct",
            CurrencyCode = "PHP",
            Amount = request.Amount,
            EstimatedValue = request.Amount,
            ImpactUnit = "pesos",
            Notes = "Donor portal contribution"
        };

        context.Donations.Add(donation);
        await context.SaveChangesAsync();

        return Ok(new DonorDonationDto
        {
            DonationId = donation.DonationId,
            Date = donation.DonationDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Amount = donation.Amount ?? 0m,
            Campaign = donation.CampaignName ?? (donation.IsRecurring ? "Monthly Giving" : "Direct Gift"),
            IsRecurring = donation.IsRecurring,
            Status = "Completed"
        });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await context.AppUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(appUser => appUser.AppUserId == userId && appUser.IsActive);

        if (user is null || !user.SupporterId.HasValue)
        {
            return NotFound(new { message = "No donor profile is linked to this account." });
        }

        var supporter = await context.Supporters
            .AsNoTracking()
            .FirstOrDefaultAsync(record => record.SupporterId == user.SupporterId.Value);

        if (supporter is null)
        {
            return NotFound(new { message = "Donor record could not be found." });
        }

        var donations = await context.Donations
            .AsNoTracking()
            .Where(donation => donation.SupporterId == supporter.SupporterId && donation.Amount != null)
            .OrderByDescending(donation => donation.DonationDate)
            .ToListAsync();

        var currentYear = DateOnly.FromDateTime(DateTime.UtcNow).Year;
        var totalGiven = donations.Sum(donation => donation.Amount ?? 0m);
        var thisYear = donations
            .Where(donation => donation.DonationDate.Year == currentYear)
            .Sum(donation => donation.Amount ?? 0m);

        var monthlyGiving = donations
            .GroupBy(donation => new { donation.DonationDate.Year, donation.DonationDate.Month })
            .OrderBy(group => group.Key.Year)
            .ThenBy(group => group.Key.Month)
            .Select(group => new DonorMonthlyGivingPointDto
            {
                Month = new DateTime(group.Key.Year, group.Key.Month, 1).ToString("MMM", CultureInfo.InvariantCulture),
                Amount = group.Sum(donation => donation.Amount ?? 0m)
            })
            .ToList();
        var personalCampaignBreakdown = donations
            .GroupBy(donation => string.IsNullOrWhiteSpace(donation.CampaignName) ? "Direct Giving" : donation.CampaignName!)
            .Select(group => new OrganizationCampaignBreakdownDto
            {
                Label = group.Key,
                TotalAmount = group.Sum(donation => donation.Amount ?? 0m),
                DonationCount = group.Count()
            })
            .OrderByDescending(group => group.TotalAmount)
            .Take(5)
            .ToList();

        var allMonetaryDonations = await context.Donations
            .AsNoTracking()
            .Where(donation => donation.Amount != null)
            .ToListAsync();

        var organizationMonthlyTrends = allMonetaryDonations
            .GroupBy(donation => new { donation.DonationDate.Year, donation.DonationDate.Month })
            .OrderBy(group => group.Key.Year)
            .ThenBy(group => group.Key.Month)
            .Select(group => new OrganizationMonthlyGivingPointDto
            {
                Month = new DateTime(group.Key.Year, group.Key.Month, 1).ToString("MMM", CultureInfo.InvariantCulture),
                TotalAmount = group.Sum(donation => donation.Amount ?? 0m),
                DonorCount = group.Select(donation => donation.SupporterId).Distinct().Count()
            })
            .ToList();

        var campaignBreakdown = allMonetaryDonations
            .GroupBy(donation => string.IsNullOrWhiteSpace(donation.CampaignName) ? "Direct Giving" : donation.CampaignName!)
            .Select(group => new OrganizationCampaignBreakdownDto
            {
                Label = group.Key,
                TotalAmount = group.Sum(donation => donation.Amount ?? 0m),
                DonationCount = group.Count()
            })
            .OrderByDescending(group => group.TotalAmount)
            .Take(4)
            .ToList();

        var activeSupporters = await context.Supporters.CountAsync(supporter => supporter.Status == "Active");
        var activeMonetaryDonors = await context.Supporters.CountAsync(supporter =>
            supporter.Status == "Active" && supporter.SupporterType == "MonetaryDonor");
        var recurringDonors = allMonetaryDonations
            .Where(donation => donation.IsRecurring)
            .Select(donation => donation.SupporterId)
            .Distinct()
            .Count();
        var totalContributionValue = allMonetaryDonations.Sum(donation => donation.Amount ?? 0m);
        var averageGiftAmount = allMonetaryDonations.Count != 0
            ? totalContributionValue / allMonetaryDonations.Count
            : 0m;
        var impactPrediction = await context.MlDonorImpactPredictions
            .AsNoTracking()
            .Where(row => row.SupporterId == supporter.SupporterId)
            .OrderByDescending(row => row.ScoredAtUtc)
            .FirstOrDefaultAsync();

        if (impactPrediction is null)
        {
            impactPrediction = await context.MlDonorImpactPredictions
                .AsNoTracking()
                .OrderByDescending(row => row.ScoredAtUtc)
                .FirstOrDefaultAsync();
        }

        var response = new DonorDashboardResponse
        {
            Profile = new DonorProfileDto
            {
                SupporterId = supporter.SupporterId,
                DisplayName = supporter.DisplayName,
                FirstName = supporter.FirstName,
                LastName = supporter.LastName,
                Email = supporter.Email,
                Phone = supporter.Phone,
                Country = supporter.Country,
                Region = supporter.Region
            },
            Summary = new DonorSummaryDto
            {
                TotalGiven = totalGiven,
                ThisYear = thisYear,
                DonationCount = donations.Count,
                HasRecurringGift = donations.Any(donation => donation.IsRecurring),
                CounselingSessionsFunded = (int)Math.Floor(totalGiven / 200m),
                MonthsHousingFunded = (int)Math.Floor(totalGiven / 2500m),
                ResidentsHelpedEstimate = totalGiven <= 0m ? 0 : Math.Max(1, (int)Math.Floor(totalGiven / 1500m))
            },
            MonthlyGiving = monthlyGiving,
            RecentDonations = donations
                .Take(8)
                .Select(donation => new DonorDonationDto
                {
                    DonationId = donation.DonationId,
                    Date = donation.DonationDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    Amount = donation.Amount ?? 0m,
                    Campaign = donation.CampaignName ?? (donation.IsRecurring ? "Monthly Giving" : "Direct Gift"),
                    IsRecurring = donation.IsRecurring,
                    Status = "Completed"
                })
                .ToList(),
            PersonalCampaignBreakdown = personalCampaignBreakdown,
            OrganizationImpact = new DonorOrganizationImpactDto
            {
                ActiveSupporters = activeSupporters,
                ActiveMonetaryDonors = activeMonetaryDonors,
                RecurringDonors = recurringDonors,
                DonationEvents = allMonetaryDonations.Count,
                TotalContributionValue = totalContributionValue,
                AverageGiftAmount = decimal.Round(averageGiftAmount, 2),
                MonthlyTrends = organizationMonthlyTrends,
                CampaignBreakdown = campaignBreakdown
            },
            ImpactPrediction = impactPrediction is null
                ? null
                : new DonorImpactPredictionDto
                {
                    ImpactScore = impactPrediction.ImpactScore,
                    PredictedTopProgramArea = impactPrediction.PredictedTopProgramArea,
                    PredictedEducationShare = impactPrediction.PredictedEducationShare,
                    ModelVersion = impactPrediction.ModelVersion,
                    ScoredAtUtc = impactPrediction.ScoredAtUtc.ToString("O", CultureInfo.InvariantCulture)
                }
        };

        return Ok(response);
    }
}
