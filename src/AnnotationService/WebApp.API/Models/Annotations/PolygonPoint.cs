using WebApp.API.Common;

namespace WebApp.API.Models.Annotations;

public class PolygonPoint : BaseEntity
{
    private PolygonPoint()
    {
        // Only EF
    }

    internal PolygonPoint(Guid annotationId, double time, double frequency, int index)
    {
        Time = time;
        Frequency = frequency;
        AnnotationId = annotationId;
        Index = index;
    }

    public Guid AnnotationId { get; }
    public double Time { get; }
    public double Frequency { get; }

    public int Index { get; }
}