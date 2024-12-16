import React, {Component, ComponentPropsWithRef, Fragment, useEffect, useRef, useState} from 'react';
import {Container, Nav, Navbar} from 'react-bootstrap';
import {Link, NavigateFunction} from 'react-router-dom';
import {LoginMenu} from '../api-authorization/LoginMenu';
import './NavMenu.css';
import authService from '../api-authorization/AuthorizeService';
import {Box, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {AccountBox, Copyright, Logout} from "@mui/icons-material";
import {useNavigate} from "react-router";


interface IState {
    collapsed: boolean,
    isAuthenticated: boolean,
    isAdmin: boolean,
    drawerOpen: boolean
}

interface IProps {
    
}


export const NavMenu : React.FC<IProps> = () =>  {
    
    const [state, setState] = useState({
        collapsed: true,
        isAuthenticated: false,
        isAdmin: false,
        drawerOpen: false
    });
    
    const _subscription = useRef<number | undefined>(undefined);
    
    useEffect(() => {
        _subscription.current = authService.subscribe(() => _populateState())
        _populateState();
        
        return () => {
            if (_subscription.current){
                authService.unsubscribe(_subscription.current)   
            }
        }
    }, [])
    
    const _populateState = async () => {
        const [isAuthenticated, isAdmin] = await Promise.all([authService.isAuthenticated(), authService.isAdmin()])
        setState((prevState) => {
            return {
                ...prevState,
                isAuthenticated: isAuthenticated,
                isAdmin: isAdmin
            }
        });
    }

    const toggleNavbar = (value?: boolean) => {
        console.log("Toggle Navbar")
        setState(prevState => {
            return {
                ...prevState,
                collapsed: value || !prevState.collapsed
            };
        });
    }


    const _renderAdminMenu = () => {
        return (
            <Fragment>
                <Nav.Item>
                    <Nav.Link eventKey="users" as={Link} to="/users">Users</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        eventKey="projects"
                        to="/projects">
                        Projects
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        eventKey="label-sets"
                        as={Link}
                        to="/label-sets">
                        Label Sets
                    </Nav.Link>
                </Nav.Item>
            </Fragment>
        )
    }

    const _renderNonAdminMenu = () => {
        return (
            <>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        eventKey="projects"
                        to="/projects">
                        Projects
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        eventKey="label-sets"
                        to="/label-sets">
                        Label Sets
                    </Nav.Link>
                </Nav.Item>
                {/*<NavItem>*/}
                {/*    <NavLink*/}
                {/*        tag={Link}*/}
                {/*        to="/networks">*/}
                {/*        Networks*/}
                {/*    </NavLink>*/}
                {/*</NavItem>*/}
            </>
        )
    }
    
    const toggleDrawer = (open: boolean) =>  {
        setState(prevState => {
            return {
                ...prevState,
                drawerOpen: open
            }
        })
    }
    
    const navigate = useNavigate();

        return (
            <Navbar
                onToggle={(expanded) => toggleNavbar(!expanded)}
                onSelect={() => {
                    setState(prevState => {
                        return {
                            ...prevState,
                            collapsed: true
                        }
                    })
                }}
                expanded={!state.collapsed}
                className="bg-tu-dresden mb-3"
                expand="sm"
                variant="dark"
            >
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        Oriolix
                    </Navbar.Brand>
                    <Navbar.Toggle
                        aria-controls="responsive-navbar-nav"
                        className="mr-2"/>
                    <Navbar.Collapse
                        onEnter={() => console.log("Exit")}
                        onExit={() => console.log("Exit")}
                        id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            {
                                !state.isAuthenticated ? null : (
                                    state.isAdmin ? _renderAdminMenu() : _renderNonAdminMenu()
                                )
                            }
                        </Nav>
                        {
                            !state.collapsed || !state.isAuthenticated ?  <Nav>
                                <LoginMenu/>
                            </Nav> : 
                                state.isAuthenticated ?
                                <Nav>
                                    <Button className="mr-2" type="button" onClick={() => toggleDrawer(true)}>
                                        <span className="navbar-toggler-icon"></span>
                                    </Button>
                                    <Drawer
                                        anchor="left"
                                        open={state.drawerOpen}
                                        onClose={() => toggleDrawer(false)}
                                    >
                                        <Box
                                            sx={{
                                                width: 250
                                            }}
                                            role="presentation"
                                            onClick={() => toggleDrawer(false)}
                                            onKeyDown={() => toggleDrawer(false)}
                                        >
                                            <List>
                                                <ListItem key="licenses" disablePadding>
                                                    <ListItemButton onClick={() => navigate("/licenses")}>
                                                        <ListItemIcon>
                                                            <Copyright/>
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary="Licenses"
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                                <ListItem key="profile" disablePadding>
                                                <ListItemButton onClick={() => navigate("/authentication/profile")}>
                                                    <ListItemIcon>
                                                        <AccountBox/>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Profile"
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                                <ListItem key="logout" disablePadding>
                                                    <ListItemButton onClick={() => navigate("/authentication/logout")}>
                                                        <ListItemIcon>
                                                            <Logout/>
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary="Logout"
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            </List>
                                            
                                        </Box>
                                    </Drawer>
                                </Nav> : null
                        }
                        
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    
}
