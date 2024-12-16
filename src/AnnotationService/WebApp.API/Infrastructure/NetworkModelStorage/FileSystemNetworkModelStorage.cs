using WebApp.API.Infrastructure.FileSystem;
using WebApp.API.Models.Classification;

namespace WebApp.API.Infrastructure.NetworkModelStorage;

public class FileSystemNetworkModelStorage : INetworkModelStorage
{
    private const string SubFolder = "networks";

    private readonly string _basePath;

    public FileSystemNetworkModelStorage(FileSystemSettings settings, IWebHostEnvironment environment)
    {
        _basePath = Path.Join(environment.ContentRootPath, settings.PathPrefix, SubFolder);

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public void SaveModel(Stream model, Guid networkId, ModelFormat format)
    {
        using var fileStream = File.Create(GetModelUri(networkId, format));
        model.CopyTo(fileStream);
        fileStream.Flush();
    }


    public void DeleteModel(Guid networkId, ModelFormat format)
    {
        File.Delete(GetModelUri(networkId, format));
    }


    public string GetModelUri(Guid networkId, ModelFormat format)
    {
        var ext = format == ModelFormat.H5 ? ".h5" : "";
        
        return Path.Join(
            _basePath,
            networkId.ToString() + ext
        );
    }
    public bool DoesModelExist(Guid networkId, ModelFormat format)
    {
        return File.Exists(GetModelUri(networkId, format));
    }
}