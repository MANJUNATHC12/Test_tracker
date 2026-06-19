using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using TestingTracker.Api.Data;
using TestingTracker.Api.Models;

namespace TestingTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ImportController : ControllerBase
    {
        private readonly TestingTrackerContext _context;

        public ImportController(TestingTrackerContext context)
        {
            _context = context;
        }

        [HttpPost("excel")]
        public async Task<IActionResult> ImportExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var ext = Path.GetExtension(file.FileName).ToLower();
            if (ext != ".xlsx")
                return BadRequest("Only .xlsx files are supported.");

            int testCasesAdded = 0;
            int tasksAdded = 0;

            try
            {
                using var stream = file.OpenReadStream();
                using var workbook = new XLWorkbook(stream);

                // Check for "Test Items Tracker" sheet
                if (workbook.TryGetWorksheet("Test Items Tracker", out var testSheet))
                {
                    var rows = testSheet.RowsUsed().Skip(1); // skip header
                    foreach (var row in rows)
                    {
                        var testedBy = row.Cell(6).GetString().Trim().ToLower();
                        if (!testedBy.Contains("manjunath")) continue;

                        var createdDateVal = row.Cell(10).Value;
                        DateTime createdDate = DateTime.Now;
                        if (createdDateVal.IsDateTime) createdDate = createdDateVal.GetDateTime();
                        else if (createdDateVal.IsText && DateTime.TryParse(createdDateVal.GetText(), out var parsedDate)) createdDate = parsedDate;

                        var testId = row.Cell(1).GetString().Trim();
                        var module = row.Cell(2).GetString().Trim();
                        var subMod = row.Cell(3).GetString().Trim();
                        var issue = row.Cell(4).GetString().Trim();
                        var desc = row.Cell(5).GetString().Trim();
                        var priority = row.Cell(7).GetString().Trim();
                        if (string.IsNullOrEmpty(priority)) priority = "Medium";
                        var status = row.Cell(8).GetString().Trim();
                        if (string.IsNullOrEmpty(status)) status = "Open";
                        var owner = row.Cell(9).GetString().Trim();

                        var targetDateVal = row.Cell(11).Value;
                        DateTime? targetDate = null;
                        if (targetDateVal.IsDateTime) targetDate = targetDateVal.GetDateTime();

                        var feature = string.IsNullOrEmpty(subMod) ? module : subMod;
                        var title = $"[{testId}] {module} - {feature}";
                        if (title.Length > 200) title = title.Substring(0, 197) + "...";

                        // Avoid duplicates
                        bool exists = _context.TestCases.Any(tc => tc.Title == title && tc.CreatedDate.Date == createdDate.Date);
                        if (exists) continue;

                        var fullDesc = $"Priority: {priority} | Status: {status} | Tested by: {row.Cell(6).GetString().Trim()} | Owner: {owner}";
                        if (!string.IsNullOrEmpty(issue)) fullDesc = $"Issue: {issue} | " + fullDesc;
                        if (!string.IsNullOrEmpty(desc)) fullDesc += $"\nDetails: {desc}";

                        var steps = $"1. Navigate to {module}\n2. Verify: {(string.IsNullOrEmpty(issue) ? "functional testing" : issue)}";
                        var expected = string.IsNullOrEmpty(desc) ? $"{feature} functions per specification" : $"Feature works correctly. Bug: {desc}";

                        var tc = new TestCase
                        {
                            Title = title,
                            Description = fullDesc,
                            Steps = steps,
                            ExpectedResult = expected,
                            CreatedDate = createdDate
                        };
                        _context.TestCases.Add(tc);
                        testCasesAdded++;

                        var taskTitle = $"[{testId}] {feature}";
                        if (taskTitle.Length > 200) taskTitle = taskTitle.Substring(0, 197) + "...";
                        
                        var isCompleted = status.ToLower() == "closed" || status.ToLower() == "fixed" || status.ToLower() == "completed" || status.ToLower() == "done";

                        var task = new TaskItem
                        {
                            Title = taskTitle,
                            Description = $"Module: {module} | {(string.IsNullOrEmpty(issue) ? desc : issue)}",
                            IsCompleted = isCompleted,
                            CreatedDate = createdDate,
                            DueDate = targetDate ?? createdDate.AddDays(2)
                        };
                        _context.Tasks.Add(task);
                        tasksAdded++;
                    }
                }

                // Create a daily log entry for today if we imported anything
                if (testCasesAdded > 0)
                {
                    var today = DateTime.UtcNow.Date;
                    var hours = Math.Max(2, Math.Min(8, testCasesAdded / 4));
                    
                    var existingLog = _context.DailyLogs.FirstOrDefault(l => l.Date.Date == today);
                    if (existingLog != null)
                    {
                        existingLog.Description = $"Imported {testCasesAdded} new test items via file upload.";
                        existingLog.HoursSpent = hours;
                    }
                    else
                    {
                        _context.DailyLogs.Add(new DailyLog
                        {
                            Date = DateTime.UtcNow,
                            Description = $"Imported {testCasesAdded} new test items via file upload.",
                            HoursSpent = hours
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "File processed successfully",
                    testCasesAdded = testCasesAdded,
                    tasksAdded = tasksAdded
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error during import: {ex.Message}");
            }
        }
    }
}
