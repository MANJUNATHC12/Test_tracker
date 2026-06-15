using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestingTracker.Api.Data;
using TestingTracker.Api.Models;

namespace TestingTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestCasesController : ControllerBase
{
    private readonly TestingTrackerContext _context;

    public TestCasesController(TestingTrackerContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TestCase>>> GetAll()
    {
        return await _context.TestCases.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TestCase>> Get(int id)
    {
        var tc = await _context.TestCases.FindAsync(id);
        if (tc == null) return NotFound();
        return tc;
    }

    [HttpPost]
    public async Task<ActionResult<TestCase>> Create(TestCase testCase)
    {
        _context.TestCases.Add(testCase);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = testCase.Id }, testCase);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, TestCase updated)
    {
        if (id != updated.Id) return BadRequest();
        var existing = await _context.TestCases.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Title = updated.Title;
        existing.Description = updated.Description;
        existing.Steps = updated.Steps;
        existing.ExpectedResult = updated.ExpectedResult;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tc = await _context.TestCases.FindAsync(id);
        if (tc == null) return NotFound();
        _context.TestCases.Remove(tc);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
