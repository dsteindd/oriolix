using Microsoft.AspNetCore.Mvc;
using WebApp.API.Application.Annotations;
using WebApp.API.Common;
using WebApp.API.Models.Annotations;
using WebApp.API.Models.AudioFiles.Rules;
using WebApp.API.Models.Projects;
using WebApp.API.Services;

namespace WebApp.API.Models.AudioFiles;

public class AudioFile : BaseEntity
{
    private AudioFile()
    {
        // Only EF
    }

    private AudioFile(
        Guid ownerId,
        Guid? projectId,
        string name,
        double? latitude = null,
        double? longitude = null,
        DateTime? startedOn = null
    )
    {
        OwnerId = ownerId;
        ProjectId = projectId;
        Name = name;

        var formatParseSuccess = AudioFileFormat.TryParse(
            Path.GetExtension(name).TrimStart('.'),
            ignoreCase: true,
            out AudioFileFormat format
        );

        // TODO: BusinessRule
        if (!formatParseSuccess)
        {
            throw new Exception("Cannot parse audio file format");
        }

        Format = format;
        Latitude = latitude;
        Longitude = longitude;
        Annotations = new List<Annotation>();
        UploadedOn = DateTime.UtcNow;
        StartedOn = startedOn;
        IsPreprocessingFinished = false;
    }

    public static AudioFile CreateNew(
        Guid ownerId,
        Guid? projectId,
        string name,
        Stream fileStream,
        IAudioFileStorage audioFileStorage,
        double? latitude = null,
        double? longitude = null,
        DateTime? startedOn = null
    )
    {
        var audioFile = new AudioFile(
            ownerId,
            projectId,
            name,
            latitude,
            longitude,
            startedOn
        );

        audioFile.SaveAudioFile(fileStream, audioFileStorage);

        return audioFile;
    }

    public string Name { get; } = null!;
    public Guid? OwnerId { get; }

    public Guid? ProjectId { get; private set; }

    public double? Latitude { get; }
    public double? Longitude { get; }
    public DateTime UploadedOn { get; }

    public DateTime? StartedOn { get; }

    public float? Duration { get; private set; }

    public int? SampleRate { get; private set; }

    public List<Annotation> Annotations { get; } = new List<Annotation>();

    public bool IsPreprocessingFinished { get; private set; }

    public AudioFileFormat Format { get; }

    // public void SetDuration(float duration)
    // {
    //     Duration = duration;
    // }
    //
    // public void SetSampleRate(int sampleRate)
    // {
    //     SampleRate = sampleRate;
    // }

    public void AddAnnotation(
        Guid annotatorId,
        AnnotationLabel primaryLabel,
        AnnotationLabel? secondaryLabel,
        List<PolygonPointDto> points,
        int confidence
        )
    {
        // TODO: Check Rule of annotator id is member of project the file belongs to
        
        // TODO: Check range of annotation points is valid, e.g. in audio duration and in audio frequency range
        
        var annotation = Annotation.OfFile(annotatorId, Id, primaryLabel, secondaryLabel, points, confidence);

        Annotations.Add(annotation);
    }

    public void RemoveAnnotation(Guid annotationId, Guid removerId)
    {
        var annotationToRemove = Annotations.FirstOrDefault(a => a.Id == annotationId);
        

        if (annotationToRemove == null) return;
        
        this.CheckRule(new AnnotationCanOnlyBeDeletedByOwnerRule(removerId, annotationToRemove.AnnotatorId!.Value));

        Annotations.Remove(annotationToRemove);
    }

    public void FinishPreProcessing(float duration, int sampleRate)
    {
        Duration = duration;
        SampleRate = sampleRate;
        IsPreprocessingFinished = true;
    }

    public void SetProject(Guid projectId)
    {
        ProjectId = projectId;
    }

    public void Delete(IAudioFileStorage audioFileStorage)
    {
        audioFileStorage.DeleteAudioFile(this.Id, this.Format);

        this.CheckRule(new FileMustBeDeletedAfterRemovalRule(this.Id, this.Format, audioFileStorage));
    }

    private void SaveAudioFile(Stream fileStream, IAudioFileStorage fileStorage)
    {
        fileStorage.SaveAudioFile(fileStream, this.Id, this.Format);

        this.CheckRule(new FileMustExistAfterCreationRule(this.Id, this.Format, fileStorage));
    }

    public DownloadFileResult Download(bool denoise, IAudioFileStorage audioFileStorage)
    {
        // TODO: Check permission
        
        var result = denoise
            ? audioFileStorage.DownloadDenoisedAudioFile(this.Id, this.Format)
            : audioFileStorage.DownloadAudioFile(this.Id, this.Format);

        result.FileName = Name;

        return result;
    }

    private IEnumerable<Guid> GetAnnotationIds()
    {
        return Annotations.Select(a => a.Id);
    }

    public void ChangeAnnotationConfidence(Guid requestAnnotationId, int requestNewConfidence, Guid changeUserId)
    {
        this.CheckRule(new ChangeConfidenceAnnotationMustExistRule(requestAnnotationId, GetAnnotationIds()));

        var annotation = Annotations.First(a => a.Id == requestAnnotationId);

        annotation.ChangeConfidence(requestNewConfidence, changeUserId);
    }
}

public enum AudioFileFormat
{
    Wav,
    Mp3
}