using System;
using System.ComponentModel.DataAnnotations;

namespace TestingTracker.Api.Models
{
    public class TestCase
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Steps { get; set; }

        public string? ExpectedResult { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
