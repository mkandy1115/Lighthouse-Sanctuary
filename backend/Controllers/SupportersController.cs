using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Supporters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SupportersController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSupporters(
        [FromQuery] string? type = null,
        [FromQuery] string? search = null)
    {
        var query = context.Supporters.AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(s => s.SupporterType == type);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                s.DisplayName.ToLower().Contains(term) ||
                (s.Email != null && s.Email.ToLower().Contains(term)));
        }

        var supporters = await query
            .OrderBy(s => s.DisplayName)
            .ToListAsync();

        var supporterIds = supporters.Select(s => s.SupporterId).ToList();
        var donationSummaries = await context.Donations
            .AsNoTracking()
            .Where(donation => supporterIds.Contains(donation.SupporterId))
            .GroupBy(donation => donation.SupporterId)
            .Select(group => new
            {
                supporterId = group.Key,
                totalGiven = group.Sum(donation => donation.Amount ?? donation.EstimatedValue ?? 0m),
                lastGiftDate = group.Max(donation => donation.DonationDate)
            })
            .ToDictionaryAsync(group => group.supporterId);

        return Ok(supporters.Select(supporter =>
        {
            var donationSummary = donationSummaries.GetValueOrDefault(supporter.SupporterId);
            return new
            {
                supporter.SupporterId,
                supporter.SupporterType,
                supporter.DisplayName,
                supporter.OrganizationName,
                supporter.FirstName,
                supporter.LastName,
                supporter.RelationshipType,
                supporter.Region,
                supporter.Country,
                supporter.Email,
                supporter.Phone,
                supporter.Status,
                supporter.CreatedAt,
                supporter.FirstDonationDate,
                supporter.AcquisitionChannel,
                totalGiven = donationSummary?.totalGiven ?? 0m,
                lastGiftDate = donationSummary?.lastGiftDate
            };
        }));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSupporter(int id)
    {
        var supporter = await context.Supporters
            .AsNoTracking()
            .FirstOrDefaultAsync(record => record.SupporterId == id);

        if (supporter is null)
        {
            return NotFound();
        }

        var donations = await context.Donations
            .AsNoTracking()
            .Where(d => d.SupporterId == id)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        var allocations = await context.DonationAllocations
            .AsNoTracking()
            .Where(a => donations.Select(d => d.DonationId).Contains(a.DonationId))
            .OrderByDescending(a => a.AllocationDate)
            .ToListAsync();

        return Ok(new
        {
            supporter,
            donations,
            allocations
        });
    }

    [HttpGet("top-donors")]
    public async Task<IActionResult> GetTopDonors([FromQuery] int limit = 10)
    {
        var normalizedLimit = Math.Clamp(limit, 1, 50);

        var donors = await context.Supporters
            .Where(supporter => supporter.SupporterType == "MonetaryDonor")
            .GroupJoin(
                context.Donations.Where(donation => donation.Amount != null),
                supporter => supporter.SupporterId,
                donation => donation.SupporterId,
                (supporter, donations) => new TopDonorDto
                {
                    SupporterId = supporter.SupporterId,
                    DisplayName = supporter.DisplayName,
                    Email = supporter.Email,
                    TotalGiven = donations.Sum(donation => donation.Amount ?? 0m),
                    DonationCount = donations.Count()
                })
            .Where(donor => donor.TotalGiven > 0)
            .OrderByDescending(donor => donor.TotalGiven)
            .ThenBy(donor => donor.DisplayName)
            .Take(normalizedLimit)
            .ToListAsync();

        return Ok(donors);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSupporter([FromBody] CreateSupporterRequest request)
    {
        var supporter = new Supporter
        {
            SupporterType = request.SupporterType,
            DisplayName = request.DisplayName,
            OrganizationName = request.OrganizationName,
            FirstName = request.FirstName,
            LastName = request.LastName,
            RelationshipType = request.RelationshipType,
            Region = request.Region,
            Country = request.Country,
            Email = request.Email,
            Phone = request.Phone,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            AcquisitionChannel = request.AcquisitionChannel
        };

        context.Supporters.Add(supporter);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSupporter), new { id = supporter.SupporterId }, supporter);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSupporter(int id, [FromBody] UpdateSupporterRequest request)
    {
        var supporter = await context.Supporters.FirstOrDefaultAsync(record => record.SupporterId == id);
        if (supporter is null)
        {
            return NotFound();
        }

        supporter.DisplayName = request.DisplayName;
        supporter.Email = request.Email;
        supporter.Phone = request.Phone;
        supporter.Status = request.Status;
        supporter.SupporterType = request.SupporterType ?? supporter.SupporterType;
        supporter.RelationshipType = request.RelationshipType;

        await context.SaveChangesAsync();
        return Ok(supporter);
    }

    [HttpGet("{id:int}/donations")]
    public async Task<IActionResult> GetSupporterDonations(int id)
    {
        var supporterExists = await context.Supporters.AnyAsync(s => s.SupporterId == id);
        if (!supporterExists)
        {
            return NotFound();
        }

        var donations = await context.Donations
            .Where(d => d.SupporterId == id)
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        return Ok(donations);
    }
}
