using AutoMapper.Internal;
using WebApp.API.Application.Projects.ShareProject.Rules;
using WebApp.API.Common;
using WebApp.API.Models.AudioFiles;
using WebApp.API.Models.LabelSets;
using WebApp.API.Models.Projects.Rules;

namespace WebApp.API.Models.Projects;

public class Project : BaseEntity
{
    public Guid OwnerId { get; }
    public string OwnerName { get; }
    public string Name { get; private set; }

    public List<ProjectMember> Members { get; }


    public string? Description { get; private set; }

    public List<AudioFile> Files { get; }

    public Guid? PrimaryLabelSetId { get; private set; }
    public LabelSet? PrimaryLabelSet { get; }

    public Guid? SecondaryLabelSetId { get; private set; }
    public LabelSet? SecondaryLabelSet { get; }

    private Project()
    {
        // Only EF
        Members = new List<ProjectMember>();
    }

    private Project(
        Guid ownerId,
        string ownerName,
        string name,
        string? description
    )
    {
        Name = name;
        OwnerName = ownerName;
        Description = description;
        Files = new List<AudioFile>();
        OwnerId = ownerId;

        Members = new List<ProjectMember>();

        Members.Add(ProjectMember.CreateNew(
            this.Id,
            ownerId,
            ownerName,
            ProjectRole.Owner
        ));
    }

    public static Project New(Guid ownerId, string ownerName, string name, string? description)
    {
        return new Project(ownerId, ownerName, name, description);
    }

    public void AddAudioFile(AudioFile audioFile)
    {
        audioFile.SetProject(this.Id);
        Files.Add(audioFile);
    }

    public void SetPrimaryLabelSet(Guid? labelSetId)
    {
        PrimaryLabelSetId = labelSetId;
    }

    public void SetSecondaryLabelSet(Guid secondaryLabelSetId)
    {
        SecondaryLabelSetId = secondaryLabelSetId;
    }

    public void EditProject(Guid editorId, string name, string? description, Guid? primaryLabelSetId, Guid? secondaryLabelSetId)
    {
        this.CheckRule(new ProjectCanOnlyBeEditedByOwnerRule(OwnerId, editorId));
        
        Name = name;
        Description = description;
        PrimaryLabelSetId = primaryLabelSetId;
        SecondaryLabelSetId = secondaryLabelSetId;
    }

    public void AddMember(Guid sharerId, Guid userId, string userName)
    {
        this.CheckRule(new ProjectCanOnlyBeSharedByOwnerRule(OwnerId, sharerId));
        this.CheckRule(new ProjectCanOnlyBeSharedOnceRule(userId, GetMemberIds()));
        
        Members.Add(ProjectMember.CreateNew(
            this.Id,
            userId,
            userName,
            ProjectRole.Member
        ));
    }

    public void Delete(Guid deletorId, IAudioFileStorage audioFileStorage)
    {
        this.CheckRule(new ProjectCanOnlyBeDeletedByOwnerRule(OwnerId, deletorId));
        
        foreach (var file in Files)
        {
            file.Delete(audioFileStorage);
        }

        this.CheckRule(new FilesMustBeDeletedWhenProjectIsDeletedRule(
            this.Id,
            Files.Select(f => f.Id),
            Files.Select(f => f.Format),
            audioFileStorage
        ));
    }

    public void RemoveMember(Guid editorId, Guid memberToBeRemovedId)
    {
        this.CheckRule(new ProjectCanOnlyBeEditedByOwnerRule(OwnerId, editorId));
        this.CheckRule(new CanOnlyRemoveMembersOfProjectRule(memberToBeRemovedId, GetMemberIds()));

        var member = Members.First(m => m.UserId == memberToBeRemovedId);
        
        Members.Remove(member);
        
        this.CheckRule(new ProjectMustHaveOneOwnerRule(Members));
    }

    private IEnumerable<Guid> GetMemberIds()
    {
        return Members.Select(m => m.UserId);
    }

    public void Unshare(Guid userId)
    {
        this.CheckRule(new ProjectCanOnlyBeUnsharedWithSharedUserRule(userId, GetMemberIds()));

        var memberToRemove = Members.Find(m => m.UserId == userId);
        Members.Remove(memberToRemove);
        
        this.CheckRule(new ProjectMustHaveOneOwnerRule(this.Members));
    }
}