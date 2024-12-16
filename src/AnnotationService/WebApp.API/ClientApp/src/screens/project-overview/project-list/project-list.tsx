import {
    Avatar, Divider, IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader, Menu, MenuItem
} from "@mui/material";
import React, {useState} from "react";
import {Project} from "../../../models/projects";
import {
    MdDelete, MdDownload, MdEdit,
    MdMenu,
    MdOutlineCollections,
    MdShare
} from "react-icons/md";
import {primary} from "../../../settings/colors";
import authService from "../../../components/api-authorization/AuthorizeService";
import {projectService} from "../../../services/ApiService";
import {ShareInfo} from "../../../models/file-info";
import {ConfirmModal} from "../confirm-modal/confirm-modal";
import {fetchProjects} from "../../../redux/slices/projects-slice";
import {useAppDispatch} from "../../../redux/hooks/hooks";
import {useNavigate} from "react-router";
import fileDownload from "js-file-download";
import {ShareModal} from "../../../components/ui/share-modal/share-modal";

interface ProjectListProps {
    projects: Project[],
    handleClick: (projectId: string) => void
}

export const ProjectList: React.FC<ProjectListProps> = ({
                                                            projects,
                                                            handleClick
                                                        }) => {
    return (
        <List
            sx={{width: '100%', backgroundColor: 'background.paper'}}
            subheader={<ListSubheader>Projects</ListSubheader>}
        >
            {
                projects.map(p => <ProjectItem key={p.id} project={p} handleClick={handleClick}/>)
            }
        </List>
    )
}

interface ProjectItemProps {
    project: Project,
    handleClick: (projectId: string) => void,
}

const ProjectItem: React.FC<ProjectItemProps> = ({
                                                     project,
                                                     handleClick
                                                 }) => {

    const [openShareModal, setOpenShareModal] = useState(false)
    const [shareInfo, setShareInfo] = useState<ShareInfo[]>([]);

    const [openConfirmDeletionModal, setOpenConfirmDeletionModal] = useState(false);


    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const dispatch = useAppDispatch();

    const handleMenuClose = () => {

        setAnchorEl(null);
    };

    const _resetProjectShareInfo = async (id: string): Promise<void> => {
        const token = await authService.getAccessToken();
        const shareInfo = await projectService.getProjectShareInfo(token, id);

        setShareInfo(shareInfo);
    }

    const _onConfirmDelete = async () => {
        const token = await authService.getAccessToken();
        await projectService.deleteProject(token!, project.id);

        setOpenConfirmDeletionModal(false)

        dispatch(fetchProjects())
    }

    const _downloadAnnotations = async (): Promise<void> => {
        const token = await authService.getAccessToken();
        const download = await projectService.downloadProjectAnnotations(token, project.id)
        
        if (!!download){
            fileDownload(await download.content, download.fileName)
        }
    }

    const navigate = useNavigate();

    return (
        <div>
            <ListItem
                secondaryAction={
                    <IconButton edge="end" onClick={handleClickMenu} disabled={!project.isOwner}>
                        <MdMenu/>
                    </IconButton>
                }
                alignItems="flex-start"
            >
                <ListItemButton
                    onClick={() => handleClick(project.id)}>
                    <ListItemAvatar>
                        <Avatar
                            sx={{width: 36, height: 36, backgroundColor: primary}}>
                            <MdOutlineCollections/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={project.name}
                        secondary={project.isOwner ? `Owned`: `Shared (by ${project.ownerName})`}/>
                </ListItemButton>
            </ListItem>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
            >
                <MenuItem
                    disabled={!project.isOwner}
                    onClick={() => {
                        handleMenuClose()
                        setOpenShareModal(true)
                    }}>
                    <ListItemIcon>
                        <MdShare/>
                    </ListItemIcon>
                    <ListItemText>Share</ListItemText>
                </MenuItem>
                <MenuItem onClick={async () => {
                    await _downloadAnnotations();
                }}>
                    <ListItemIcon>
                        <MdDownload/>
                    </ListItemIcon>
                    <ListItemText>Download Annotations (.json)</ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!project.isOwner}
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                >
                    <ListItemIcon>
                        <MdEdit/>
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!project.isOwner}
                    onClick={() => {
                        handleMenuClose()
                        setOpenConfirmDeletionModal(true)
                    }}
                >
                    <ListItemIcon>
                        <MdDelete/>
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
            <ShareModal
                id={project.id}
                closeModal={() => {
                    setOpenShareModal(false)
                }}
                isOpen={openShareModal}
                resetShareInfo={_resetProjectShareInfo}
                shareInfos={shareInfo}
                onShare={async (mail) => {
                    const token = await authService.getAccessToken();
                    return await projectService.shareProject(token, project.id, mail);
                }}
                onUnshare={async (shareInfo) => {
                    const token = await authService.getAccessToken();
                    await projectService.unshareProject(token, project.id, shareInfo.userId);
                }}
            />
            <ConfirmModal
                title="Confirm Deletion"
                content={
                    <p>
                        Are you sure you want to delete the project <span
                        style={{textDecorationLine: "underline"}}>{project.name}</span>?
                        <span style={{fontWeight: "bold"}}>
                            This will also delete all files and annotations within the project!
                        </span>
                    </p>
                }
                handleConfirm={_onConfirmDelete}
                handleCancel={() => setOpenConfirmDeletionModal(false)}
                isOpen={openConfirmDeletionModal}
                onHide={() => setOpenConfirmDeletionModal(false)}
            />
            <Divider/>
        </div>
    )
}
