using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TestingTracker.Api.Data;
using TestingTracker.Api.Models;

namespace TestingTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TestingTrackerContext _context;
        private readonly IConfiguration _config;

        public AuthController(TestingTrackerContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower()))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Role = string.IsNullOrWhiteSpace(request.Role) ? "Tester" : request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (user == null || user.PasswordHash != HashPassword(request.Password))
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, username = user.Username, role = user.Role });
        }

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private string GenerateJwtToken(User user)
        {
            var jwt = _config.GetSection("Jwt");
            var keyString = jwt["Key"] ?? "SuperSecretDevKey123!MakeItLongerPlease";
            
            // JWT key must be at least 256 bits (32 bytes) for HmacSha256
            if (keyString.Length < 32)
            {
                keyString = keyString.PadRight(32, '!');
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"] ?? "TestingTracker",
                audience: jwt["Audience"] ?? "TestingTrackerClients",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class UserRegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Role { get; set; }
    }

    public class UserLoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
