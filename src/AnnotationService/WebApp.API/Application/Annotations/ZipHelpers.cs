using System.IO.Compression;
using Newtonsoft.Json;
using WebApp.API.Application.Annotations.DownloadAnnotationsZip;
using WebApp.API.Extensions;
using WebApp.API.Models.AudioFiles;

namespace WebApp.API.Application.Annotations;

public static class ZipHelpers
{
    private const string AnnotationFileName = "annotations.json";
    private const string SpectrogramFileName = "spec.png";

    public static async Task AppendSpectrogram(
        this ZipArchive zipArchive,
        string key,
        string specPath,
        CancellationToken cancellationToken)
    {
        var entry = zipArchive.CreateEntry(key);
        await using var specEntryStream = new FileStream(specPath, FileMode.Open);
        await using var entryStream = entry.Open();
        await specEntryStream.CopyToAsync(entryStream, cancellationToken);
        await specEntryStream.FlushAsync(cancellationToken);
    }

    public static async Task AppendAnnotations(
        this ZipArchive zip,
        string key,
        List<AnnotationExportDto> annotations,
        CancellationToken cancellationToken
    )
    {
        var annotationEntry = zip.CreateEntry(key);

        var jsonString = JsonConvert.SerializeObject(annotations, new JsonSerializerSettings
        {
            Formatting = Formatting.Indented
        });
        var jsonStream = jsonString.ToStream();

        await using var annotationEntryStream = annotationEntry.Open();
        await jsonStream.CopyToAsync(annotationEntryStream, cancellationToken);
        await annotationEntryStream.FlushAsync(cancellationToken);
    }

    public static async Task AppendAudioFile(
        this ZipArchive zip,
        string key,
        string path,
        CancellationToken cancellationToken
    )
    {
        var audioEntry = zip.CreateEntry(key, CompressionLevel.NoCompression);
        await using var audioStream = new FileStream(path, FileMode.Open);
        await using var audioEntryStream = audioEntry.Open();
        await audioStream.CopyToAsync(audioEntryStream, cancellationToken);
        await audioEntryStream.FlushAsync(cancellationToken);
    }

    public static async Task AddAudioFileEntry(
        this ZipArchive zip,
        AudioFile audioFile,
        List<AnnotationExportDto> annotationDtos,
        IAudioFileStorage _storage,
        CancellationToken cancellationToken,
        bool shouldAppendAudioFile = false,
        string baseKey = "/"
    )
    {
        await zip.AppendAnnotations(
            Path.Join(baseKey, AnnotationFileName),
            annotationDtos,
            cancellationToken
        );

        await zip.AppendSpectrogram(
            Path.Join(baseKey, SpectrogramFileName),
            _storage.GetSpectrogramUri(audioFile.Id),
            cancellationToken
        );

        if (shouldAppendAudioFile)
        {
            await zip.AppendAudioFile(
                Path.Join(baseKey, $"{audioFile.Name}"),
                _storage.GetAudioFileUri(audioFile.Id, audioFile.Format),
                cancellationToken
            );
        }
    }
}