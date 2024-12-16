namespace WebApp.API.Models.Classification;

public interface INetworkModelStorage
{
    public void SaveModel(Stream model, Guid networkId, ModelFormat format);


    public void DeleteModel(Guid networkId, ModelFormat format);


    public string GetModelUri(Guid networkId, ModelFormat format);

    public bool DoesModelExist(Guid networkId, ModelFormat format);
}