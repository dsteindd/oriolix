import {
    Avatar,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton, ListItemIcon,
    ListItemText,
    ListSubheader, Menu, MenuItem,
} from "@mui/material";
import React from "react";
import {
    MdDelete, MdDownload,
    MdEdit, MdMenu,
    MdOutlineLoyalty
} from "react-icons/md";
import {primary} from "../../../settings/colors";
import {NetworkModel} from "../../../models/network-models";
import {useNavigate} from "react-router";

interface NetworkListProps {
    networks: NetworkModel[],
    handleClick: (labelSetId: string) => void,
    handleEditClick?: (networkId: string) => void,
    handleDeleteClick?: (networkId: string) => void,
}

export const NetworkList: React.FC<NetworkListProps> = ({
                                                            networks,
                                                            handleClick,
                                                            handleEditClick,
                                                            handleDeleteClick
                                                        }) => {
    return (
        <List
            sx={{width: '100%', backgroundColor: 'background.paper'}}
            subheader={<ListSubheader>Label Sets</ListSubheader>}
        >
            {
                networks.map(n => <NetworkItem
                        network={n}
                        handleClick={handleClick}
                        handleDeleteClick={handleDeleteClick}
                        handleEditClick={handleEditClick}
                    />
                )
            }
        </List>
    )
}

interface NetworkItemProps {
    network: NetworkModel,
    handleClick: (networkId: string) => void,
    handleEditClick?: (networkId: string) => void,
    handleDeleteClick?: (networkId: string) => void,
}

const NetworkItem: React.FC<NetworkItemProps> = ({
                                                     network,
                                                     handleClick,
                                                     handleEditClick,
                                                     handleDeleteClick
                                                 }) => {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {

        setAnchorEl(null);
    };

    return (
        <div key={network.id}>
            <ListItem
                key={network.id}
                secondaryAction={
                    <IconButton edge="end" onClick={handleClickMenu} disabled={!network.isOwner}>
                        <MdMenu/>
                    </IconButton>
                }
                alignItems="flex-start"
            >
                <ListItemButton
                    disableRipple={!network.isOwner}
                    disableTouchRipple={!network.isOwner}
                    onClick={() => network.isOwner && handleClick(network.id)}>
                    <ListItemAvatar>
                        <Avatar
                            sx={{width: 36, height: 36, backgroundColor: primary}}>
                            <MdOutlineLoyalty/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={network.name}
                        secondary={`Classifier with ${network.numberOfLabels} labels`}
                    />
                </ListItemButton>
            </ListItem>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
            >
                <MenuItem
                    disabled={!network.isOwner}
                    onClick={async () => {
                        handleEditClick && handleEditClick(network.id)
                    }}>
                    <ListItemIcon>
                        <MdEdit/>
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={!network.isOwner}
                    onClick={() => {
                        handleMenuClose()
                        handleDeleteClick && handleDeleteClick(network.id)
                    }}
                >
                    <ListItemIcon>
                        <MdDelete/>
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>

            </Menu>
            <Divider/>
        </div>
    )
}
