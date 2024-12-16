using WebApp.API.Common;

namespace WebApp.API.Models.Classification;

public class Classification : BaseEntity
{
    public Guid ReportId { get; }
    public double FromTime { get; }
    public double ToTime { get; }
    public double Confidence { get; }
    public string Label { get; }

    private Classification()
    {
        // Only EF
    }
    
    private Classification(Guid reportId, double fromTime, double toTime, double confidence, string label)
    {
        ReportId = reportId;
        FromTime = fromTime;
        ToTime = toTime;
        Confidence = confidence;
        Label = label;
    }

    public static Classification New(Guid reportId, double fromTime, double toTime, double confidence, string label)
    {
        return new Classification(reportId, fromTime, toTime, confidence, label);
    }
}