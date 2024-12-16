using WebApp.API.Common;

namespace WebApp.API.Models.Classification;

public class ClassificationReport : BaseEntity
{
    public Guid ClassifierId { get; }
    public Guid FileId { get; }
    public List<Classification> Classifications { get; }
    
    public ClassificationStatus Status { get; private set; }
    
    public ClassificationReport(Guid classifierId, Guid fileId)
    {
        ClassifierId = classifierId;
        FileId = fileId;
        Classifications = new List<Classification>();
        Status = ClassificationStatus.Pending;
    }

    public void AddClassification(double from, double to, double confidence, string label)
    {
        Classifications.Add(Classification.New(this.Id, from, to, confidence, label));
    }

    public void MarkDone()
    {
        Status = ClassificationStatus.Done;
    }
}

public enum ClassificationStatus
{
    Pending,
    Done
}