using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestingTracker.Api.Data;
using TestingTracker.Api.Models;

namespace TestingTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DailyLogsController : ControllerBase
{
    private readonly TestingTrackerContext _context;

    public DailyLogsController(TestingTrackerContext context)
    {
        _context = context;
    }

    // GET: api/DailyLogs
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DailyLog>>> GetAll()
    {
        return await _context.DailyLogs.ToListAsync();
    }

    // GET: api/DailyLogs/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<DailyLog>> Get(int id)
    {
        var log = await _context.DailyLogs.FindAsync(id);
        if (log == null) return NotFound();
        return log;
    }

    // POST: api/DailyLogs
    [HttpPost]
    public async Task<ActionResult<DailyLog>> Create(DailyLog log)
    {
        _context.DailyLogs.Add(log);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = log.Id }, log);
    }

    // PUT: api/DailyLogs/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, DailyLog updated)
    {
        if (id != updated.Id) return BadRequest();
        var existing = await _context.DailyLogs.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Date = updated.Date;
        existing.Description = updated.Description;
        existing.HoursSpent = updated.HoursSpent;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/DailyLogs/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var log = await _context.DailyLogs.FindAsync(id);
        if (log == null) return NotFound();
        _context.DailyLogs.Remove(log);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
