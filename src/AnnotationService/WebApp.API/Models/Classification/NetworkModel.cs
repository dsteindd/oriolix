using System.Text;
using Microsoft.Data.SqlClient.DataClassification;
using NAudio.Wave;
using WebApp.API.Common;
using WebApp.API.Models.Classification.Rules;

namespace WebApp.API.Models.Classification;

public class NetworkModel : BaseEntity
{
    public string Name { get; private set; }
    public ModelFormat Format { get; private set; }
    public string Description { get; private set; }
    public int FrameDuration { get; private set; }
    public int FrameOverlap { get; private set; }
    
    public bool IsPublic { get; private set; }
    public Guid? CreatorId { get; }
    
    public List<NetworkModelLabel> Labels { get; }

    private NetworkModel()
    {
        // EF Core
    }
    
    
    private NetworkModel(
        ModelFormat modelFormat,
        string name,
        string description,
        int frameDuration,
        int frameOverlap,
        bool isPublic,
        Guid? creatorId
        )
    {
        Name = name;
        Description = description;
        Labels = new List<NetworkModelLabel>();
        FrameDuration = frameDuration;
        FrameOverlap = frameOverlap;
        IsPublic = isPublic;
        CreatorId = creatorId;
        Format = modelFormat;
    }

    public static NetworkModel New(
        ModelFormat modelFormat,
        string name,
        string description,
        int frameDuration,
        int frameOverlap,
        INetworkModelStorage storage,
        Stream model,
        Stream labelFile,
        bool isPublic,
        Guid? creatorId
        )
    {
        var networkModel = new NetworkModel(
            modelFormat,
            name, 
            description,
            frameDuration,
            frameOverlap,
            isPublic, 
            creatorId
            );
        
        networkModel.SaveModelFile(storage, model);
        networkModel.SetLabels(labelFile);
        
        return networkModel;
    }

    public void SetLabel(int index, string label)
    {
        var existingLabel = Labels.SingleOrDefault(l => l.Index == index);

        if (existingLabel != null)
        {
            Labels.Remove(existingLabel);
        }
        
        Labels.Add(NetworkModelLabel.New(this.Id, index, label));
    }

    public bool HasLabel(int index)
    {
        return Labels.SingleOrDefault(l => l.Index == index) != null;
    }

    public bool HasLabel(string label)
    {
        return Labels.SingleOrDefault(l => l.Label == label) != null;
    }

    public bool HasLabel(int index, string label)
    {
        return Labels.SingleOrDefault(l => l.Label == label && l.Index == index) != null;
    }

    public string GetLabel(int index)
    {
        var label = Labels.SingleOrDefault(l => l.Index == index);

        if (label == null)
        {
            throw new Exception($"Label with index {index} not found for network with id {Id}");
        }
        
        return label.Label;
    }

    public void Edit(
        string name,
        string description,
        bool isPublic
    )
    {
        Name = name;
        Description = description;
        IsPublic = isPublic;
    }

    public void Delete(INetworkModelStorage storage, Guid deletorId)
    {
        this.CheckRule(new ModelCanOnlyBeDeletedByOwnerRule(this.CreatorId!.Value, deletorId));
        
        storage.DeleteModel(Id, Format);
    }

    private void SaveModelFile(INetworkModelStorage storage, Stream network)
    {
        storage.SaveModel(network, this.Id, this.Format);
        
        this.CheckRule(new ModelFileMustExistAfterCreationRule(storage, this.Id, this.Format));
    }

    private void SetLabels(Stream labelFileStream)
    {
        using var reader = new StreamReader(labelFileStream, Encoding.UTF8);
        while (reader.ReadLine() is { } line)
        {
            SetLabel(this.Labels.Count, line);
        }
    }
}

public enum ModelFormat
{
    H5,
    Pb
}