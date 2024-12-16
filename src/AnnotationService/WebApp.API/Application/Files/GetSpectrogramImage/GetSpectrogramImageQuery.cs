using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using WebApp.API.Data;
using WebApp.API.Models.AudioFiles;

namespace WebApp.API.Application.Files.GetSpectrogramImage;

public record GetSpectrogramImageQuery(Guid FileId,
    bool Denoise = false,
    double? MinTime = null,
    double? MaxTime = null,
    double? MinFrequency = null,
    double? MaxFrequency = null) : IRequest<Stream>;
    
    
public class GetSpectrogramImageQueryHandler : IRequestHandler<GetSpectrogramImageQuery, Stream>
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly IAudioFileStorage _audioFileStorage;

    public GetSpectrogramImageQueryHandler(
        IMemoryCache cache,
        IAudioFileStorage audioFileStorage,
        ApplicationDbContext context
    )
    {
        _cache = cache;
        _audioFileStorage = audioFileStorage;
        _context = context;
    }

    public async Task<Stream> Handle(GetSpectrogramImageQuery request, CancellationToken cancellationToken)
    {
        var file = await _context.AudioFiles.FirstOrDefaultAsync(f => f.Id == request.FileId, cancellationToken);

        if (file == null)
            throw new InvalidCommandException(new List<string>
            {
                $"File with id {request.FileId} does not exist!"
            });

        if (!file.IsPreprocessingFinished)
        {
            throw new InvalidCommandException("File has not been preprocessed");
        }

        string filePath;
        if (request.Denoise)
            filePath = _audioFileStorage.GetDenoisedSpectrogramUri(file.Id);
        else
            filePath = _audioFileStorage.GetSpectrogramUri(file.Id);


        var key = $"{file.Id}?{request.Denoise}";

        var hasValue = _cache.TryGetValue<ImageCacheEntry>(key, out var data);
        if (!hasValue)
        {
            data = await GenerateImageData(filePath, cancellationToken);

            _cache.Set(key, data);
        }
        
        

        var rectangle = GenerateCropRectangle(
            request.MinTime,
            request.MaxTime,
            request.MinFrequency,
            !request.MaxFrequency.HasValue || !file.SampleRate.HasValue ?
                null: Math.Min(request.MaxFrequency.Value, (double)file.SampleRate.Value / 2)
        );


        var streamResult = new MemoryStream();

        if (rectangle != null)
        {
            using Image<L8> image = Image.LoadPixelData<L8>(data.Data, data.Width, data.Height);
            var xPixel = (int)(image.Width * (rectangle.MinTime / file.Duration!));
            var maxRawFrequency = (double)file.SampleRate! / 2;
            var width = image.Width * (rectangle.MaxTime - rectangle.MinTime) / file.Duration;

            var maxMelPixel = PhysicalFrequencyToImagePixels(
                rectangle.MaxFrequency,
                image.Height,
                0,
                maxRawFrequency);
            var minMelPixel = PhysicalFrequencyToImagePixels(
                rectangle.MinFrequency,
                image.Height,
                0,
                maxRawFrequency);

            var croppedImage = image.Clone(x => x.Crop(
                    new Rectangle(
                        (int)PhysicalTimeToImagePixels(rectangle.MinTime, (double)file.Duration!, image.Width),
                        maxMelPixel,
                        (int)width,
                        minMelPixel - maxMelPixel)
                )
            );

            await croppedImage.SaveAsync(streamResult, new PngEncoder(), cancellationToken);
        }
        else
        {
            await using Stream rawFileStream = new FileStream(filePath, FileMode.Open);
            await rawFileStream.CopyToAsync(streamResult, cancellationToken);
        }

        streamResult.Seek(0, SeekOrigin.Begin);

        return streamResult;
    }

    private static async Task<ImageCacheEntry> GenerateImageData(string filePath, CancellationToken cancellationToken)
    {
        using var outputStream = new MemoryStream();
        await using var inputStream = new FileStream(filePath, FileMode.Open);
        using var image = await Image.LoadAsync<L8>(inputStream, cancellationToken);
        var width = image.Width;
        var height = image.Height;
        var imageContent = new byte[width * height];

        image.CopyPixelDataTo(imageContent);

        return new ImageCacheEntry()
        {
            Data = imageContent,
            Width = width,
            Height = height
        };
    }

    private static CropRectangle? GenerateCropRectangle(
        double? minTime,
        double? maxTime,
        double? minFrequency,
        double? maxFrequency
    )
    {
        return minTime.HasValue &&
               maxTime.HasValue &&
               minFrequency.HasValue &&
               maxFrequency.HasValue
            ? new CropRectangle()
            {
                MinTime = minTime.Value,
                MaxTime = maxTime.Value,
                MinFrequency = minFrequency.Value,
                MaxFrequency = maxFrequency.Value
            }
            : null;
    }

    private static int PhysicalFrequencyToImagePixels(
        double frequency,
        int imageHeight,
        double minFrequency,
        double maxFrequency
    )
    {
        var minMel = CalculateMelScaleFrequency(minFrequency);
        var maxMel = CalculateMelScaleFrequency(maxFrequency);
        var mel = CalculateMelScaleFrequency(frequency);

        return (int)Math.Floor(imageHeight - (mel - minMel) * imageHeight / (maxMel - minMel));
    }

    private static double CalculateMelScaleFrequency(double frequency)
    {
        return 2595 * Math.Log10(1 + frequency / 700);
    }

    private double CalculateFrequencyFromMel(double mel)
    {
        return 700 * (Math.Pow(10, mel / 2595) - 1);
    }

    private static double PhysicalTimeToImagePixels(double time, double duration, int imageWidth)
    {
        return imageWidth * time / duration;
    }
}

public class CropRectangle
{
    public double MinTime { get; init; }
    public double MaxTime { get; init; }
    public double MinFrequency { get; init; }
    public double MaxFrequency { get; init; }
}

public class ImageCacheEntry
{
    public byte[] Data { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}