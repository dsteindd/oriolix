using WebApp.API.Application.Annotations;
using WebApp.API.Common;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.AudioFiles.Rules;

namespace WebApp.API.Models.Annotations;

public class Annotation : BaseEntity
{
    private Annotation()
    {
        // Only EF
    }

    private Annotation(Guid annotatorId,
        Guid fileId,
        AnnotationLabel primaryLabel,
        AnnotationLabel? secondaryLabel,
        List<PolygonPointDto> points,
        int confidence
        ) : base()
    {
        FileId = fileId;
        AnnotatorId = annotatorId;
        Primary = primaryLabel;
        Secondary = secondaryLabel;
        CreatedAt = DateTime.UtcNow;
        Points = points.Select((p, index) => new PolygonPoint(Id, p.Time, p.Frequency, index)).ToList();
        
        this.CheckRule(new AnnotationConfidenceMustBeBetweenOneAndFiveRule(confidence));
        Confidence = confidence;
    }

    public Guid? AnnotatorId { get; }
    // public ApplicationUser? Annotator { get; }
    public Guid FileId { get; }
    public AudioFile File { get; }

    public AnnotationLabel Primary { get; private set; }
    public AnnotationLabel? Secondary { get; private set; }
    
    public int Confidence { get; private set; }

    public DateTime CreatedAt { get; }

    public List<PolygonPoint> Points { get; } = new List<PolygonPoint>();

    internal static Annotation OfFile(
        Guid annotatorId, 
        Guid fileId, 
        AnnotationLabel primaryLabel,
        AnnotationLabel? secondaryLabel,
        List<PolygonPointDto> points,
        int confidence
        )
    {
        return new Annotation(
            annotatorId,
            fileId,
            primaryLabel,
            secondaryLabel,
            points,
            confidence
            );
    }
    
    // TODO: Revert this once migration is over!
    internal void SetPrimaryLabel(string name, string altName)
    {
        Primary = AnnotationLabel.New(name, altName);
    }

    internal void SetSecondaryLabel(string name, string? altName)
    {
        Secondary = AnnotationLabel.New(name, altName);
    }

    public void ChangeConfidence(int requestNewConfidence, Guid changeUserId)
    {
        this.CheckRule(new AnnotationConfidenceMustBeBetweenOneAndFiveRule(requestNewConfidence));
        this.CheckRule(new AnnotationConfidenceCanOnlyBeChangedByOwnerRule(AnnotatorId!.Value, changeUserId));
        
        Confidence = requestNewConfidence;
    }
}