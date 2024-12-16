import {
    Avatar, Divider, IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    ListSubheader
} from "@mui/material";
import React from "react";
import {
    MdDelete,
    MdOutlineLoyalty
} from "react-icons/md";
import {primary} from "../../../settings/colors";
import {LabelSet} from "../../../models/label-set";

interface LabelSetListProps {
    labelSets: LabelSet[],
    handleClick: (labelSetId: string) => void,
    handleDelete: (labelSetId: string) => void,
}

export const LabelSetList: React.FC<LabelSetListProps> = ({
                                                              labelSets,
                                                              handleClick,
                                                              handleDelete
                                                          }) => {
    return (
        <List
            sx={{width: '100%', backgroundColor: 'background.paper'}}
            subheader={<ListSubheader>Label Sets</ListSubheader>}
        >
            {
                labelSets.map(ls => <LabelSetItem key={ls.id} labelSet={ls} handleClick={handleClick} handleDelete={handleDelete}/>)
            }
        </List>
    )
}

interface LabelSetItemProps {
    labelSet: LabelSet,
    handleClick: (labelSetId: string) => void,
    handleDelete: (labelSetId: string) => void,
}

const LabelSetItem: React.FC<LabelSetItemProps> = ({
                                                       labelSet,
                                                       handleDelete
                                                   }) => {


    return (
        <div key={labelSet.id}>
            <ListItem
                key={labelSet.id}
                secondaryAction={
                    <IconButton
                        edge="end"
                        onClick={() => handleDelete(labelSet.id)}
                        disabled={labelSet.isPublic || !labelSet.isOwner}>
                        <MdDelete/>
                    </IconButton>
                }
                alignItems="flex-start"
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
                        primary={labelSet.name}
                        secondary={labelSet.description}/>
                </ListItemButton>

            </ListItem>
            <Divider/>
        </div>
    )
}
