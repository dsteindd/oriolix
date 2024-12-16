using WebApp.API.Common;

namespace WebApp.API.Models.Annotations;

// Value Object
public class AnnotationLabel
{
    public string Name { get; }
    public string? AltName { get; }

    private AnnotationLabel()
    {
    }

    private AnnotationLabel(string name, string? altName)
    {
        Name = name;
        AltName = altName;
    }

    public static AnnotationLabel New(string name, string? altName)
    {
        return new AnnotationLabel(
            name,
            altName
        );
    }
}