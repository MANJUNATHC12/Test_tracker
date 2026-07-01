using System;
using System.ComponentModel.DataAnnotations;

namespace TestingTracker.Api.Models
{
    public class Requirement
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string ReqId { get; set; } = string.Empty;
        
        public string Module { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string Requestor { get; set; } = string.Empty;
        
        public string Priority { get; set; } = "Medium";
        
        public string Status { get; set; } = "Open";
        
        public string Owner { get; set; } = string.Empty;
        
        public DateTime CreatedDate { get; set; }
        public DateTime? TargetDate { get; set; }
        public DateTime? ActualCompletion { get; set; }
        
        public string Remarks { get; set; } = string.Empty;
    }
}
