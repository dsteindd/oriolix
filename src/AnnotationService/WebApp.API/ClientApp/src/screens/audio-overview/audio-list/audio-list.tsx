import {
    Avatar, Box, Divider, IconButton, LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader, Menu, MenuItem
} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {
    MdDelete, MdDownload,
    MdMenu,
    MdOutlineAudiotrack
} from "react-icons/md";
import {primary} from "../../../settings/colors";
import authService from "../../../components/api-authorization/AuthorizeService";
import {fileService, projectService} from "../../../services/ApiService";
import {FileDownload, FileInfo} from "../../../models/file-info";
import {ConfirmModal} from "../../project-overview/confirm-modal/confirm-modal";
import fileDownload from "js-file-download";

interface AudioListProps {
    files: FileInfo[],
    handleClick: (fileId: string) => void,
    disableDelete: boolean,
    handleDelete?: (fileId: string) => void,
    reload?: (fileId: string) => void
}

export const AudioList: React.FC<AudioListProps> = ({
                                                        files,
                                                        handleClick,
                                                        disableDelete = true,
                                                        handleDelete,
                                                        reload
                                                    }) => {
    return (
        <List
            sx={{width: '100%', backgroundColor: 'background.paper'}}
            subheader={<ListSubheader>Audio Files</ListSubheader>}
        >
            {
                files.map(f => <AudioListItem
                    key={f.id}
                    file={f}
                    handleClick={handleClick}
                    disableDelete={disableDelete}
                    handleDelete={handleDelete}
                    reload={reload}
                />)
            }
        </List>
    )
}


const useInterval = (callback: () => void, delay: number, shouldStop: () => boolean) => {
    const savedCallback = useRef<() => void>()

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback])

    useEffect(() => {
        const id = setInterval(() => {
            if (shouldStop()) {
                clearInterval(id);
            } else {
                savedCallback.current && savedCallback.current();
            }
        }, 2000)

        return () => {
            clearInterval(id);
        }
    }, [callback, delay])

}


interface AudioFileItemProps {
    file: FileInfo,
    disableDelete: boolean,
    handleClick: (fileInfo: string) => void,
    handleDelete?: (fileId: string) => void,
    reload?: (fileId: string) => void
}

const AudioListItem: React.FC<AudioFileItemProps> = ({
                                                         file,
                                                         handleClick,
                                                         disableDelete = true,
                                                         handleDelete,
                                                         reload
                                                     }) => {

    const [openConfirmDeletionModal, setOpenConfirmDeletionModal] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {

        setAnchorEl(null);
    };

    const _downloadAudio = async (): Promise<void> => {
        const token = await authService.getAccessToken();
        const download: FileDownload = await fileService.downloadFile(token!, file.id);
        fileDownload(await download.content, download.fileName);
    }

    const _downloadAnnotations = async (): Promise<void> => {
        const token = await authService.getAccessToken();
        const download = await projectService.downloadProjectFileAnnotations(token, file.projectId, file.id)
        fileDownload(await download.content, download.fileName)
    }

    const _onConfirmDelete = async () => {
        const token = await authService.getAccessToken();
        await fileService.deleteFile(token!, file.id);

        setOpenConfirmDeletionModal(false)

        // refetch files
        handleDelete && handleDelete(file.id)
    }

    useInterval(
        () => {
            reload && reload(file.id)
        }, 2000,
        () => file.isPreprocessingFinished
    );

    return (
        <div>
            <ListItem
                secondaryAction={
                    <IconButton edge="end" onClick={handleClickMenu} disabled={!file.isPreprocessingFinished}>
                        <MdMenu/>
                    </IconButton>
                }
                alignItems="flex-start"
            >
                <ListItemButton
                    disabled={!file.isPreprocessingFinished}
                    onClick={() => handleClick(file.id)}
                >
                    <ListItemAvatar>
                        <Avatar
                            sx={{width: 36, height: 36, backgroundColor: primary}}>
                            <MdOutlineAudiotrack/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={file.name}
                        secondary={`${file.numAnnotations} annotations`}
                    />
                </ListItemButton>
            </ListItem>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
            >
                <MenuItem
                    disabled={disableDelete}
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
                <MenuItem onClick={async () => {
                    await _downloadAudio();
                }}>
                    <ListItemIcon>
                        <MdDownload/>
                    </ListItemIcon>
                    <ListItemText>Download Audio</ListItemText>
                </MenuItem>
                <MenuItem 
                    disabled={file.numAnnotations === 0}
                    onClick={async () => {
                    await _downloadAnnotations();
                }}>
                    <ListItemIcon>
                        <MdDownload/>
                    </ListItemIcon>
                    <ListItemText>Download Annotations (.json)</ListItemText>
                </MenuItem>
            </Menu>
            <ConfirmModal
                title="Confirm Deletion"
                content={
                    <p>
                        Are you sure you want to delete the audio file <span
                        style={{textDecorationLine: "underline"}}>{file.name}</span>?
                        <span style={{fontWeight: "bold"}}>
                            This will also delete all annotations within the file!
                        </span>
                    </p>
                }
                handleConfirm={_onConfirmDelete}
                handleCancel={() => setOpenConfirmDeletionModal(false)}
                isOpen={openConfirmDeletionModal}
                onHide={() => setOpenConfirmDeletionModal(false)}
            />
            {
                !file.isPreprocessingFinished ?
                    <Box sx={{width: "100%"}}>
                        <LinearProgress/>
                    </Box>
                    : null
            }
            <Divider/>
        </div>
    )
}
