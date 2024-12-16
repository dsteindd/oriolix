import React from 'react';
import {Avatar, Link, List, ListItem, ListItemAvatar, ListItemText, Typography} from "@mui/material";
import {License} from "../../licenses";

interface LicensesProps {
    licenses: License[]
}

export const Licenses: React.FC<LicensesProps> = ({licenses}) => {
    
    return (
        <List>
            {
                licenses.map(l => <LicenseItem key={l.key} license={l}/>)
            }
        </List>
    )
    
}

interface LicenseItemProps {
    license: License
}

export const LicenseItem: React.FC<LicenseItemProps> = ({license}) => {
    let title = license.name;
    if (license.username) {
        if (title.toLowerCase() != license.username.toLowerCase()) {
            title += ` by ${license.username}`;
        }
    }
    
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar 
                    src={license.image} 
                    component="a"
                    href={license.userUrl} 
                    target="_blank"
                    variant="square"/>
            </ListItemAvatar>
            <ListItemText
                primary={
                <Typography variant="inherit">
                    <Link color="inherit" href={license.repository} target="_blank">
                        {title}
                    </Link>
                </Typography>
                }
                secondary={
                <>
                    <Typography variant="inherit">
                        <Link href={license.licenseUrl} color="inherit" target="_blank">
                            {license.licenses}
                        </Link>
                    </Typography>
                    <Typography variant="inherit">
                        {license.version}
                    </Typography>
                </>
                
                
                }
            />
        </ListItem>
    )
}