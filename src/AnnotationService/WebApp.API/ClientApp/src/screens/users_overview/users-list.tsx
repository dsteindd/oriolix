import React from "react";
import {
    Avatar, Checkbox, Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    ListSubheader
} from "@mui/material";
import { MdOutlineLoyalty} from "react-icons/md";
import {primary} from "../../settings/colors";
import {Role, User} from "../../models/user";
import {Email, RemoveModerator, Shield} from "@mui/icons-material";

interface LabelSetListProps {
    users: User[],
    handleAdminRoleSwitch: (userId: string, shouldBeAdmin: boolean) => Promise<void>
}

export const UsersList: React.FC<LabelSetListProps> = ({
                                                           users,
                                                           handleAdminRoleSwitch
                                                       }) => {
    return (
        <List
            sx={{width: '100%', backgroundColor: 'background.paper'}}
            subheader={<ListSubheader>Users</ListSubheader>}
        >
            {
                users.map(u => <UserItem key={u.id}
                                         user={u}
                                         handleAdminRoleSwitch={handleAdminRoleSwitch}/>)
            }
        </List>
    )
}

interface UserItemProps {
    user: User,
    handleAdminRoleSwitch: (userId: string, shouldBeAdmin: boolean) => Promise<void>
}

const UserItem: React.FC<UserItemProps> = ({
                                               user,
                                               handleAdminRoleSwitch
                                           }) => {

    return (
        <div>
            <ListItem
                alignItems="flex-start"
                secondaryAction={
                <>
                    <Checkbox
                        icon={<RemoveModerator/>}
                        checkedIcon={<Shield/>}
                        checked={user.roles.includes(Role.Admin)}
                        onChange={async (event) => {
                            handleAdminRoleSwitch && await handleAdminRoleSwitch(user.id, event.target.checked)
                        }}
                    />
                    <a href={`mailto:${user.mail}?subject=Subject`}>
                        <IconButton>
                            <Email/>
                        </IconButton>
                    </a>
                  </>
                }
            >
                <ListItemButton
                    disableRipple={true}
                >
                    <ListItemAvatar>
                        <Avatar
                            sx={{width: 36, height: 36, backgroundColor: primary}}>
                            <MdOutlineLoyalty/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={user.fullName}
                        secondary={user.mail}/>
                </ListItemButton>

            </ListItem>
            <Divider/>
        </div>
    )
}
