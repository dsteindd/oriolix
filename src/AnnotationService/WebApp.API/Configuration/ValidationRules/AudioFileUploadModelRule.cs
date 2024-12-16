using FluentValidation;
using WebApp.API.Controllers.Models;

namespace WebApp.API.Configuration.ValidationRules;

public class AudioFileUploadModelRule : AbstractValidator<AudioFileUploadModel>
{
    public AudioFileUploadModelRule()
    {
        RuleFor(afum => afum.File.ContentType).NotEmpty()
            .Must(ct => AllowedContentTypes.AllowedTypes.Contains(ct))
            .WithMessage(
                $"Only files with content type {string.Join(", ", AllowedContentTypes.AllowedTypes)} supported");

        RuleFor(afum => afum.Latitude).LessThan(90).GreaterThan(-90)
            .WithMessage("Latitude must be in [-90, 90]");

        RuleFor(afum => afum.Longitude).LessThan(180).GreaterThan(-180)
            .WithMessage("Longitude must be in [-180, 180]");
    }
    
    private static class AllowedContentTypes
    {
        private const string Wav = "audio/wav";
        private const string Flac = "audio/flac";
        private const string Mp3 = "audio/mp3";
        private const string Mpeg = "audio/mpeg";
        private const string XWav = "audio/x-wav";

        public static string[] AllowedTypes => new[]
        {
            Wav,
            XWav,
            Flac,
            Mp3,
            Mpeg
        };
    }
}