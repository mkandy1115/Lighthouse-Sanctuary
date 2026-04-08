using Lighthouse.Sanctuary.Api.Data;
using Lighthouse.Sanctuary.Api.Models;
using Lighthouse.Sanctuary.Api.Models.Donations;
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
            var firstName = request.FirstName?.Trim();
            var lastName = request.LastName?.Trim();
            var email = request.Email?.Trim().ToLowerInvariant();

            if (!request.IsAnonymous
                && (string.IsNullOrWhiteSpace(firstName)
                    || string.IsNullOrWhiteSpace(lastName)
                    || string.IsNullOrWhiteSpace(email)))
            {
                return BadRequest(new { message = "Name and email are required unless the donation is anonymous." });
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

        if (string.IsNullOrWhiteSpace(request.ProgramArea))
        {
            return BadRequest(new { message = "Program area is required." });
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
