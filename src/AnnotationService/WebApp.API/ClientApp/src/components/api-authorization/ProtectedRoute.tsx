import React, {Component, PropsWithChildren} from 'react'
import {Navigate, Outlet} from 'react-router';
import {ApplicationPaths, QueryParameterNames} from './ApiAuthorizationConstants'
import authService from './AuthorizeService'

interface ProtectedRouteProps {
    path: string,
    isAllowed: boolean,
    isAuthenticated: boolean,
    ready: boolean
}


export default class ProtectedRoute extends Component<PropsWithChildren<ProtectedRouteProps>> {

    // private _subscription: number | undefined;

    constructor(props: ProtectedRouteProps) {
        super(props);

        this.state = {
            ready: false,
            authenticated: false
        };
    }
    
    render() {
        const link = document.createElement("a");
        link.href = this.props.path;
        const returnUrl = `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
        const redirectUrl = `${ApplicationPaths.Login}?${QueryParameterNames.ReturnUrl}=${encodeURIComponent(returnUrl)}`
        if (!this.props.ready){
            return (<div></div>)
        }
        else if (!this.props.isAuthenticated){
            return <Navigate to={redirectUrl}/>
        }
        else if (this.props.isAuthenticated && !this.props.isAllowed){
            return (
                <div>
                    You are forbidden to view this page!
                </div>
            )
        } else {
            return this.props.children ? this.props.children: <Outlet/>
        }
        
    }
}
