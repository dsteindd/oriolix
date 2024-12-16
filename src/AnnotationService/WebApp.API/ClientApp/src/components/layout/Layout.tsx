import React, {Component, PropsWithChildren} from 'react';
import {Container} from 'react-bootstrap';
import {NavMenu} from './NavMenu';
import {BottomNavigation, BottomNavigationAction, colors, Link, Paper, Typography} from "@mui/material";
import {useNavigate} from "react-router";
import {background, primary} from "../../settings/colors";

interface LayoutProps {}

export const Layout : React.FC<PropsWithChildren<LayoutProps>> = ({children}) => {
    
        return (
            <div>
                <NavMenu/>
                <Container>
                    {children}
                </Container>                
            </div>
        );
}

Layout.displayName = Layout.name;
