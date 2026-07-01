using System;
using System.ComponentModel.DataAnnotations;

namespace TestingTracker.Api.Models
{
    public class Issue
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string IssueId { get; set; } = string.Empty;
        
        public string Module { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string Severity { get; set; } = "Medium";
        
        public string ReportedBy { get; set; } = string.Empty;
        
        public string Owner { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Open";
        
        public DateTime CreatedDate { get; set; } // Maps to "Open Date"
        public DateTime? TargetDate { get; set; } // Maps to "Due Date"
        
        public int DaysOpen { get; set; }
        
        public DateTime? ActualCompletion { get; set; }
        
        public string Resolution { get; set; } = string.Empty;
        public string TestId { get; set; } = string.Empty;
    }
}
