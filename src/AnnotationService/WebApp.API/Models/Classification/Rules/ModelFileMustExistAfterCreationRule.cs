using WebApp.API.Contracts;

namespace WebApp.API.Models.Classification.Rules;

public class ModelFileMustExistAfterCreationRule : IBusinessRule
{
    private readonly INetworkModelStorage _networkModelStorage;
    private readonly Guid _networkId;
    private readonly ModelFormat _format;

    public ModelFileMustExistAfterCreationRule(INetworkModelStorage networkModelStorage, Guid networkId, ModelFormat format)
    {
        _networkModelStorage = networkModelStorage;
        _networkId = networkId;
        _format = format;
    }

    public bool IsBroken => !_networkModelStorage.DoesModelExist(_networkId, _format);
    public string Message => $"Network model for network with id {_networkId} could not be saved";
}