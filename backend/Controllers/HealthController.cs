using Microsoft.AspNetCore.Mvc;

namespace Lighthouse.Sanctuary.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            service = "Lighthouse Sanctuary API",
            utc = DateTime.UtcNow
        });
    }
}
