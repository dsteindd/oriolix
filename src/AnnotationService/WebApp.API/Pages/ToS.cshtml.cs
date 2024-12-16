using Microsoft.AspNetCore.Mvc.RazorPages;
using WebApp.API.Settings;

namespace WebApp.API.Pages;

public class ToSModel : PageModel
{
    public ToSModel(OperatorSettings settings)
    {
        Settings = settings;
    }
    
    public OperatorSettings Settings { get; set; }
}