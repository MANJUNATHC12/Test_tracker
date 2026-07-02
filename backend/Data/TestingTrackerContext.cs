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
        public DbSet<User> Users => Set<User>();
        public DbSet<Requirement> Requirements => Set<Requirement>();
        public DbSet<Issue> Issues => Set<Issue>();
        public DbSet<TestItem> TestItems => Set<TestItem>();
    }
}
