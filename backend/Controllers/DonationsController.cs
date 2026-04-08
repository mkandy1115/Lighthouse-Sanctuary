using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Donations;
using Lighthouse.Sanctuary.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DonationsController(LighthouseContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetDonations([FromQuery] int? supporterId = null)
    {
        var query = context.Donations.AsNoTracking();
        if (supporterId.HasValue)
        {
            query = query.Where(d => d.SupporterId == supporterId.Value);
        }

        var donations = await query
            .OrderByDescending(d => d.DonationDate)
            .ToListAsync();

        return Ok(donations);
    }

    [HttpPost("public")]
    [AllowAnonymous]
    public async Task<IActionResult> CreatePublicDonation([FromBody] PublicDonationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Donation amount must be greater than zero." });
        }

        Supporter? supporter = null;

        if (request.SupporterId.HasValue)
        {
            supporter = await context.Supporters
                .FirstOrDefaultAsync(record => record.SupporterId == request.SupporterId.Value);

            if (supporter is null)
            {
                return BadRequest(new { message = "The selected donor account could not be found." });
            }
        }
        else
        {
            var firstName = InputSanitizer.NormalizePlainText(request.FirstName, 80);
            var lastName = InputSanitizer.NormalizePlainText(request.LastName, 80);
            var email = InputSanitizer.NormalizeEmail(request.Email);

            if (!request.IsAnonymous
                && (string.IsNullOrWhiteSpace(firstName)
                    || string.IsNullOrWhiteSpace(lastName)
                    || string.IsNullOrWhiteSpace(email)))
            {
                return BadRequest(new { message = "Name and email are required unless the donation is anonymous." });
            }
            if (InputSanitizer.LooksUnsafe(firstName)
                || InputSanitizer.LooksUnsafe(lastName))
            {
                return BadRequest(new { message = "Donation identity fields contain unsafe input." });
            }

            supporter = new Supporter
            {
                SupporterType = "MonetaryDonor",
                DisplayName = request.IsAnonymous
                    ? $"Anonymous Donor {DateTime.UtcNow:yyyyMMddHHmmss}"
                    : $"{firstName} {lastName}",
                FirstName = request.IsAnonymous ? null : firstName,
                LastName = request.IsAnonymous ? null : lastName,
                Email = request.IsAnonymous ? null : email,
                RelationshipType = "International",
                Country = "Ghana",
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                AcquisitionChannel = "Website"
            };

            context.Supporters.Add(supporter);
            await context.SaveChangesAsync();
        }

        var donation = new Donation
        {
            SupporterId = supporter.SupporterId,
            DonationType = "Monetary",
            DonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsRecurring = request.IsRecurring,
            CampaignName = string.IsNullOrWhiteSpace(request.CampaignName) ? null : request.CampaignName.Trim(),
            ChannelSource = "Direct",
            CurrencyCode = "PHP",
            Amount = request.Amount,
            EstimatedValue = request.Amount,
            ImpactUnit = "pesos",
            Notes = request.IsAnonymous ? "Anonymous public donation" : "Public donation"
        };

        context.Donations.Add(donation);

        if (!supporter.FirstDonationDate.HasValue)
        {
            supporter.FirstDonationDate = donation.DonationDate;
        }

        await context.SaveChangesAsync();

        return Ok(new PublicDonationResponse
        {
            DonationId = donation.DonationId,
            SupporterId = supporter.SupporterId,
            IsAnonymous = request.IsAnonymous,
            Message = request.IsAnonymous
                ? "Anonymous donation received."
                : "Donation received successfully."
        });
    }

    [HttpPost("staff")]
    public async Task<IActionResult> CreateStaffDonation([FromBody] CreateStaffDonationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var supporterExists = await context.Supporters.AnyAsync(s => s.SupporterId == request.SupporterId);
        if (!supporterExists)
        {
            return BadRequest(new { message = "Supporter not found." });
        }

        var safehouseExists = await context.Safehouses.AnyAsync(s => s.SafehouseId == request.SafehouseId);
        if (!safehouseExists)
        {
            return BadRequest(new { message = "Safehouse not found." });
        }

        request.ProgramArea = InputSanitizer.NormalizePlainText(request.ProgramArea, 40);
        request.DonationType = InputSanitizer.NormalizePlainText(request.DonationType, 40);
        request.ChannelSource = InputSanitizer.NormalizePlainText(request.ChannelSource, 64);
        request.CurrencyCode = InputSanitizer.NormalizePlainText(request.CurrencyCode, 12);
        request.ImpactUnit = InputSanitizer.NormalizePlainText(request.ImpactUnit, 32);
        request.CampaignName = InputSanitizer.NormalizePlainText(request.CampaignName, 120);
        request.Notes = InputSanitizer.NormalizePlainText(request.Notes, 1000, allowNewLines: true);
        request.AllocationNotes = InputSanitizer.NormalizePlainText(request.AllocationNotes, 1000, allowNewLines: true);

        if (string.IsNullOrWhiteSpace(request.ProgramArea))
        {
            return BadRequest(new { message = "Program area is required." });
        }
        if (!InputSanitizer.IsAllowedValue(request.DonationType, "Monetary", "InKind", "Time", "Skills", "SocialMedia")
            || !InputSanitizer.IsAllowedValue(request.ProgramArea, "Education", "Wellbeing", "Operations", "Transport", "Maintenance", "Outreach"))
        {
            return BadRequest(new { message = "Invalid donation type or program area." });
        }

        var donation = new Donation
        {
            SupporterId = request.SupporterId,
            DonationType = request.DonationType,
            DonationDate = request.DonationDate,
            IsRecurring = request.IsRecurring,
            CampaignName = request.CampaignName,
            ChannelSource = request.ChannelSource,
            CurrencyCode = request.CurrencyCode,
            Amount = request.Amount,
            EstimatedValue = request.EstimatedValue ?? request.Amount,
            ImpactUnit = request.ImpactUnit,
            Notes = request.Notes
        };

        context.Donations.Add(donation);
        await context.SaveChangesAsync();

        var allocation = new DonationAllocation
        {
            DonationId = donation.DonationId,
            SafehouseId = request.SafehouseId,
            ProgramArea = request.ProgramArea.Trim(),
            AmountAllocated = request.AmountAllocated,
            AllocationDate = request.DonationDate,
            AllocationNotes = request.AllocationNotes
        };

        context.DonationAllocations.Add(allocation);
        await context.SaveChangesAsync();

        return Ok(new
        {
            donation,
            allocation
        });
    }
}
