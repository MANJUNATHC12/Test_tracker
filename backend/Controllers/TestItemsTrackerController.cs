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
    public class TestItemsTrackerController : ControllerBase
    {
        private readonly TestingTrackerContext _context;

        public TestItemsTrackerController(TestingTrackerContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTestItems()
        {
            var items = await _context.TestItems
                .OrderByDescending(t => t.CreatedDate)
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var total = await _context.TestItems.CountAsync();
            var pass = await _context.TestItems.CountAsync(t => t.Status.ToLower() == "pass" || t.Status.ToLower() == "passed" || t.Status.ToLower() == "closed" || t.Status.ToLower() == "done");
            var fail = await _context.TestItems.CountAsync(t => t.Status.ToLower() == "fail" || t.Status.ToLower() == "failed");
            var open = total - pass - fail;

            return Ok(new { Total = total, Pass = pass, Fail = fail, Open = open });
        }
    }
}
