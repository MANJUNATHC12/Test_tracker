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
    public class IssuesController : ControllerBase
    {
        private readonly TestingTrackerContext _context;

        public IssuesController(TestingTrackerContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetIssues()
        {
            var issues = await _context.Issues
                .OrderByDescending(i => i.CreatedDate)
                .ToListAsync();
            return Ok(issues);
        }
        
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var total = await _context.Issues.CountAsync();
            var open = await _context.Issues.CountAsync(i => i.Status.ToLower() == "open" || i.Status.ToLower() == "in progress" || i.Status.ToLower() == "new");
            var resolved = await _context.Issues.CountAsync(i => i.Status.ToLower() == "closed" || i.Status.ToLower() == "resolved" || i.Status.ToLower() == "fixed");
            
            return Ok(new { Total = total, Open = open, Resolved = resolved });
        }
    }
}
