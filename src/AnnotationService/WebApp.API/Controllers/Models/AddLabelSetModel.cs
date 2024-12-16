namespace WebApp.API.Controllers.Models;

public class AddLabelSetModel
{
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsPublic { get; set; }
    public List<string> LabelNames { get; set; }
    public List<string> LabelAltNames { get; set; }
}