namespace WebApp.API.Application.Files.GetAudioFiles;

public class AudioFileDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public Guid? OwnerId { get; set; }
    
    public Guid ProjectId { get; set; }

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime UploadedOn { get; set; }

    public DateTime? StartedOn { get; set; }

    public float Duration { get; set; }

    public int SampleRate { get; set; }

    public int NumAnnotations { get; set; }

    public bool IsPreprocessingFinished { get; set; }
}