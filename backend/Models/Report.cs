using System;
using System.ComponentModel.DataAnnotations;

namespace TestingTracker.Api.Models
{
    public class Report
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Content { get; set; }

        public DateTime GeneratedOn { get; set; } = DateTime.UtcNow;
    }
}
