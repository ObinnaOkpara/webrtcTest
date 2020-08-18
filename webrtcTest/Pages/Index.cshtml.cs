using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace webrtcTest.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        public Guid RoomId { get; set; }

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        public IActionResult OnGet(Guid? r)
        {
            if (r == null)
            {
                r = Guid.NewGuid();
                return RedirectToPage($"./Index", new { r });
            }
            else
            {
                RoomId = r.GetValueOrDefault();
                return Page();
            }
        }
    }
}
