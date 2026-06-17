using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using TestingTracker.Api.Data;
using TestingTracker.Api.Models;

namespace TestingTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly TestingTrackerContext _context;

        public ReportsController(TestingTrackerContext context)
        {
            _context = context;
        }

        // GET: api/Reports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Report>>> GetAll()
        {
            return await _context.Reports.OrderByDescending(r => r.GeneratedOn).ToListAsync();
        }

        // GET: api/Reports/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Report>> Get(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null) return NotFound();
            return report;
        }

        // POST: api/Reports — generates a comprehensive QA metrics report
        [HttpPost]
        public async Task<ActionResult<Report>> Generate()
        {
            var totalTestCases = await _context.TestCases.CountAsync();
            var totalTasks = await _context.Tasks.CountAsync();
            var completedTasks = await _context.Tasks.CountAsync(t => t.IsCompleted);

            // For hours spent, sum them up (handle case where no daily logs exist)
            var totalHoursSpent = 0;
            if (await _context.DailyLogs.AnyAsync())
            {
                totalHoursSpent = await _context.DailyLogs.SumAsync(l => l.HoursSpent);
            }

            // ─── Module Breakdown from TestCase titles ───
            var testCases = await _context.TestCases.ToListAsync();
            var moduleBreakdown = new Dictionary<string, int>();
            var statusBreakdown = new Dictionary<string, int>
            {
                { "Open", 0 }, { "Closed", 0 }, { "Fixed", 0 }, { "Other", 0 }
            };

            foreach (var tc in testCases)
            {
                // Parse module from title — aggregate by high-level module
                string module = "Other";
                var titleLower = (tc.Title ?? "").ToLower();
                if (titleLower.Contains("procurement") || titleLower.StartsWith("[pr-api"))
                    module = "Procurement";
                else if (titleLower.Contains("inv-") || titleLower.Contains("inventory"))
                    module = "Inventory";
                else if (titleLower.Contains("so-") || titleLower.Contains("sales"))
                    module = "Sales & Distribution";
                else if (titleLower.Contains("hr-") || titleLower.Contains("hr "))
                    module = "HR Management";
                else if (titleLower.Contains("production") || titleLower.Contains("master"))
                    module = "Production & Masters";

                if (!moduleBreakdown.ContainsKey(module))
                    moduleBreakdown[module] = 0;
                moduleBreakdown[module]++;

                // Parse status from description
                var descLower = (tc.Description ?? "").ToLower();
                if (descLower.Contains("status: closed") || descLower.Contains("status: completed"))
                    statusBreakdown["Closed"]++;
                else if (descLower.Contains("status: fixed"))
                    statusBreakdown["Fixed"]++;
                else if (descLower.Contains("status: open"))
                    statusBreakdown["Open"]++;
                else
                    statusBreakdown["Other"]++;
            }

            // Remove zero-value status entries
            var cleanStatus = statusBreakdown.Where(s => s.Value > 0).ToDictionary(s => s.Key, s => s.Value);

            // ─── Tasks by Module ───
            var tasks = await _context.Tasks.ToListAsync();
            var tasksByModule = new Dictionary<string, object>();

            foreach (var task in tasks)
            {
                string mod = "Other";
                var descLower = (task.Description ?? "").ToLower();
                if (descLower.Contains("module: procurement") || descLower.Contains("module:  procurement"))
                    mod = "procurement";
                else if (descLower.Contains("module: inventory") || descLower.Contains("module:  inventory"))
                    mod = "Inventory";
                else if (descLower.Contains("module: sales") || descLower.Contains("module:  sales"))
                    mod = "Sales & Distribution";
                else if (descLower.Contains("module: hr") || descLower.Contains("module:  hr"))
                    mod = "HR management";

                if (!tasksByModule.ContainsKey(mod))
                    tasksByModule[mod] = new Dictionary<string, int> { { "total", 0 }, { "completed", 0 } };

                var modData = (Dictionary<string, int>)tasksByModule[mod];
                modData["total"]++;
                if (task.IsCompleted)
                    modData["completed"]++;
            }

            // ─── Daily Activity ───
            var dailyLogs = await _context.DailyLogs.OrderBy(d => d.Date).ToListAsync();
            var dailyActivity = dailyLogs.Select(d => new
            {
                date = d.Date.ToString("yyyy-MM-dd"),
                description = d.Description ?? "",
                hours = d.HoursSpent
            }).ToList();

            // ─── Build comprehensive report ───
            var reportData = new
            {
                TotalTestCases = totalTestCases,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                PendingTasks = totalTasks - completedTasks,
                TotalHoursSpent = totalHoursSpent,
                GeneratedAt = DateTime.UtcNow,
                ModuleBreakdown = moduleBreakdown,
                StatusBreakdown = cleanStatus,
                TasksByModule = tasksByModule,
                DailyActivity = dailyActivity
            };

            var jsonContent = JsonSerializer.Serialize(reportData);

            var report = new Report
            {
                Name = $"QA Metrics Report - {DateTime.Now:yyyy-MM-dd HH:mm}",
                Content = jsonContent,
                GeneratedOn = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = report.Id }, report);
        }

        // DELETE: api/Reports/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null) return NotFound();

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
