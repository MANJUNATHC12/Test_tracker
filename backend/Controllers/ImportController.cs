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


            try
            {
                using var stream = file.OpenReadStream();
                using var workbook = new XLWorkbook(stream);

                int requirementsAdded = 0;
                int issuesAdded = 0;

                // 1. Parse Requirements Tracker
                if (workbook.TryGetWorksheet("Requirements Tracker", out var reqSheet))
                {
                    var rows = reqSheet.RowsUsed().Skip(1);
                    foreach (var row in rows)
                    {
                        var reqId = row.Cell(1).GetString().Trim();
                        if (string.IsNullOrEmpty(reqId)) continue;

                        var module = row.Cell(2).GetString().Trim();
                        var description = row.Cell(3).GetString().Trim();
                        var requestor = row.Cell(4).GetString().Trim();
                        var priority = row.Cell(5).GetString().Trim();
                        if (string.IsNullOrEmpty(priority)) priority = "Medium";
                        var status = row.Cell(6).GetString().Trim();
                        if (string.IsNullOrEmpty(status)) status = "Open";
                        var owner = row.Cell(7).GetString().Trim();

                        var createdDateVal = row.Cell(8).Value;
                        DateTime createdDate = DateTime.UtcNow;
                        if (createdDateVal.IsDateTime) createdDate = createdDateVal.GetDateTime();
                        createdDate = DateTime.SpecifyKind(createdDate, DateTimeKind.Utc);

                        var targetDateVal = row.Cell(9).Value;
                        DateTime? targetDate = null;
                        if (targetDateVal.IsDateTime) targetDate = DateTime.SpecifyKind(targetDateVal.GetDateTime(), DateTimeKind.Utc);

                        var actualDateVal = row.Cell(10).Value;
                        DateTime? actualDate = null;
                        if (actualDateVal.IsDateTime) actualDate = DateTime.SpecifyKind(actualDateVal.GetDateTime(), DateTimeKind.Utc);

                        var remarks = row.Cell(11).GetString().Trim();

                        bool exists = _context.Requirements.Any(r => r.ReqId == reqId);
                        if (exists) continue;

                        _context.Requirements.Add(new Requirement
                        {
                            ReqId = reqId, Module = module, Description = description, Requestor = requestor,
                            Priority = priority, Status = status, Owner = owner, CreatedDate = createdDate,
                            TargetDate = targetDate, ActualCompletion = actualDate, Remarks = remarks
                        });
                        requirementsAdded++;
                    }
                }

                // 2. Parse Issue Tracker
                if (workbook.TryGetWorksheet("Issue Tracker", out var issueSheet))
                {
                    var rows = issueSheet.RowsUsed().Skip(1);
                    foreach (var row in rows)
                    {
                        var issueId = row.Cell(1).GetString().Trim();
                        if (string.IsNullOrEmpty(issueId)) continue;

                        var module = row.Cell(2).GetString().Trim();
                        var description = row.Cell(3).GetString().Trim();
                        var severity = row.Cell(4).GetString().Trim();
                        if (string.IsNullOrEmpty(severity)) severity = "Medium";
                        var reportedBy = row.Cell(5).GetString().Trim();
                        var owner = row.Cell(6).GetString().Trim();
                        var status = row.Cell(7).GetString().Trim();
                        if (string.IsNullOrEmpty(status)) status = "Open";

                        var openDateVal = row.Cell(8).Value;
                        DateTime createdDate = DateTime.UtcNow;
                        if (openDateVal.IsDateTime) createdDate = openDateVal.GetDateTime();
                        createdDate = DateTime.SpecifyKind(createdDate, DateTimeKind.Utc);

                        var dueDateVal = row.Cell(9).Value;
                        DateTime? targetDate = null;
                        if (dueDateVal.IsDateTime) targetDate = DateTime.SpecifyKind(dueDateVal.GetDateTime(), DateTimeKind.Utc);

                        int.TryParse(row.Cell(10).GetString().Trim(), out int daysOpen);

                        var actualDateVal = row.Cell(11).Value;
                        DateTime? actualDate = null;
                        if (actualDateVal.IsDateTime) actualDate = DateTime.SpecifyKind(actualDateVal.GetDateTime(), DateTimeKind.Utc);

                        var resolution = row.Cell(12).GetString().Trim();
                        var testId = row.Cell(13).GetString().Trim();

                        bool exists = _context.Issues.Any(i => i.IssueId == issueId);
                        if (exists) continue;

                        _context.Issues.Add(new Issue
                        {
                            IssueId = issueId, Module = module, Description = description, Severity = severity,
                            ReportedBy = reportedBy, Owner = owner, Status = status, CreatedDate = createdDate,
                            TargetDate = targetDate, DaysOpen = daysOpen, ActualCompletion = actualDate,
                            Resolution = resolution, TestId = testId
                        });
                        issuesAdded++;
                    }
                }

                // 3. Parse Test Items Tracker
                int testItemsAdded = 0;
                if (workbook.TryGetWorksheet("Test Items Tracker", out var testSheet))
                {
                    var rows = testSheet.RowsUsed().Skip(1);
                    foreach (var row in rows)
                    {
                        var testId = row.Cell(1).GetString().Trim();
                        if (string.IsNullOrEmpty(testId)) continue;

                        var module = row.Cell(2).GetString().Trim();
                        var subMod = row.Cell(3).GetString().Trim();
                        var issue = row.Cell(4).GetString().Trim();
                        var desc = row.Cell(5).GetString().Trim();
                        var testedBy = row.Cell(6).GetString().Trim();
                        var priority = row.Cell(7).GetString().Trim();
                        if (string.IsNullOrEmpty(priority)) priority = "Medium";
                        var status = row.Cell(8).GetString().Trim();
                        if (string.IsNullOrEmpty(status)) status = "Open";
                        var owner = row.Cell(9).GetString().Trim();

                        var createdDateVal = row.Cell(10).Value;
                        DateTime createdDate = DateTime.UtcNow;
                        if (createdDateVal.IsDateTime) createdDate = createdDateVal.GetDateTime();
                        createdDate = DateTime.SpecifyKind(createdDate, DateTimeKind.Utc);

                        var targetDateVal = row.Cell(11).Value;
                        DateTime? targetDate = null;
                        if (targetDateVal.IsDateTime) targetDate = DateTime.SpecifyKind(targetDateVal.GetDateTime(), DateTimeKind.Utc);

                        var actualDateVal = row.Cell(12).Value;
                        DateTime? actualDate = null;
                        if (actualDateVal.IsDateTime) actualDate = DateTime.SpecifyKind(actualDateVal.GetDateTime(), DateTimeKind.Utc);

                        var issueId = row.Cell(13).GetString().Trim();
                        var remarks = row.Cell(14).GetString().Trim();

                        bool exists = _context.TestItems.Any(t => t.TestId == testId);
                        if (exists) continue;

                        _context.TestItems.Add(new TestItem
                        {
                            TestId = testId, Module = module, SubModule = subMod, Issue = issue,
                            Description = desc, TestedBy = testedBy, Priority = priority, Status = status,
                            Owner = owner, CreatedDate = createdDate, TargetDate = targetDate,
                            ActualCompletion = actualDate, IssueId = issueId, Remarks = remarks
                        });
                        testItemsAdded++;
                    }
                }

                // Create a daily log entry for today if we imported anything
                int totalImported = testItemsAdded + requirementsAdded + issuesAdded;
                if (totalImported > 0)
                {
                    var today = DateTime.UtcNow.Date;
                    today = DateTime.SpecifyKind(today, DateTimeKind.Utc);
                    var hours = Math.Max(2, Math.Min(8, totalImported / 4));
                    
                    var existingLog = _context.DailyLogs.FirstOrDefault(l => l.Date.Date == today);
                    if (existingLog != null)
                    {
                        existingLog.Description = $"Imported {testItemsAdded} test items, {requirementsAdded} requirements, and {issuesAdded} issues via file upload.";
                        existingLog.HoursSpent = hours;
                    }
                    else
                    {
                        _context.DailyLogs.Add(new DailyLog
                        {
                            Date = DateTime.UtcNow,
                            Description = $"Imported {testItemsAdded} test items, {requirementsAdded} requirements, and {issuesAdded} issues via file upload.",
                            HoursSpent = hours
                        });
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "File processed successfully",
                    testItemsAdded = testItemsAdded,
                    requirementsAdded = requirementsAdded,
                    issuesAdded = issuesAdded
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error during import: {ex.Message}");
            }
        }
    }
}
