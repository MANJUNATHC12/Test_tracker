using System;
using System.ComponentModel.DataAnnotations;

namespace TestingTracker.Api.Models
{
    public class TestItem
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string TestId { get; set; } = string.Empty;
        
        public string Module { get; set; } = string.Empty;
        public string SubModule { get; set; } = string.Empty;
        public string Issue { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TestedBy { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";
        public string Status { get; set; } = "Open";
        public string Owner { get; set; } = string.Empty;
        
        public DateTime CreatedDate { get; set; }
        public DateTime? TargetDate { get; set; }
        public DateTime? ActualCompletion { get; set; }
        
        public string IssueId { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
    }
}
