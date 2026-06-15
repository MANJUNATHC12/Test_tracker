using Microsoft.EntityFrameworkCore;
using TestingTracker.Api.Models;

namespace TestingTracker.Api.Data
{
    public class TestingTrackerContext : DbContext
    {
        public TestingTrackerContext(DbContextOptions<TestingTrackerContext> options)
            : base(options)
        {
        }

        public DbSet<DailyLog> DailyLogs => Set<DailyLog>();
        public DbSet<TestCase> TestCases => Set<TestCase>();
        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<Report> Reports => Set<Report>();
    }
}
