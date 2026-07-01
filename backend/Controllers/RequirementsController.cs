using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestingTracker.Api.Data;
using TestingTracker.Api.Models;

namespace TestingTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RequirementsController : ControllerBase
    {
        private readonly TestingTrackerContext _context;

        public RequirementsController(TestingTrackerContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRequirements()
        {
            var requirements = await _context.Requirements
                .OrderByDescending(r => r.CreatedDate)
                .ToListAsync();
            return Ok(requirements);
        }
        
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var total = await _context.Requirements.CountAsync();
            var open = await _context.Requirements.CountAsync(r => r.Status.ToLower() == "open" || r.Status.ToLower() == "in progress");
            var completed = await _context.Requirements.CountAsync(r => r.Status.ToLower() == "closed" || r.Status.ToLower() == "completed" || r.Status.ToLower() == "done");
            
            return Ok(new { Total = total, Open = open, Completed = completed });
        }
    }
}
