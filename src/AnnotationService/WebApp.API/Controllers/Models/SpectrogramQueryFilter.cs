using Microsoft.AspNetCore.Mvc;

namespace WebApp.API.Controllers.Models;

public class SpectrogramQueryFilter
{
    [FromQuery(Name = "denoise")] public bool Denoise { get; set; } = false;
    [FromQuery(Name = "minTime")] public double? MinTime { get; set; } = null;
    [FromQuery(Name = "maxTime")] public double? MaxTime { get; set; } = null;
    [FromQuery(Name = "minFrequency")] public double? MinFrequency { get; set; } = null;
    [FromQuery(Name = "maxFrequency")] public double? MaxFrequency { get; set; } = null;

}