using System.ComponentModel;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.API.Controllers.Models;

public class AmplitudeQueryFilter
{
    [FromQuery(Name = "from")]
    [DefaultValue(null)]
    public long? From { get; set; }

    [FromQuery(Name = "to")]
    [DefaultValue(null)]
    public long? To { get; set; }

    [FromQuery(Name = "denoise")]
    [DefaultValue(false)]
    public bool Denoise { get; set; } = false;
}