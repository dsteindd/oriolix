import React, {Component, Fragment} from 'react';
import {Nav} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import authService from './AuthorizeService';
import {ApplicationPaths} from './ApiAuthorizationConstants';

interface IState {
    isAuthenticated: boolean,
    userName: string | null | undefined
}

export class LoginMenu extends Component<any, IState> {

    private _subscription: number | undefined;

    constructor(props: any) {
        super(props);

        this.state = {
            isAuthenticated: false,
            userName: null
        };
    }

    componentDidMount() {
        this._subscription = authService.subscribe(() => this.populateState());
        this.populateState();
    }

    componentWillUnmount() {
        authService.unsubscribe(this._subscription as number);
    }

    async populateState() {
        const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()])
        this.setState({
            isAuthenticated,
            userName: user && user.name
        });
    }

    render() {
        const {isAuthenticated, userName} = this.state;
        if (!isAuthenticated) {
            const registerPath = `${ApplicationPaths.Register}`;
            const loginPath = `${ApplicationPaths.Login}`;
            return this.anonymousView(registerPath, loginPath);
        } else {
            const profilePath = `${ApplicationPaths.Profile}`;
            const logoutPath = {pathname: `${ApplicationPaths.LogOut}`, state: {local: true}};
            return this.authenticatedView(userName as string, profilePath, logoutPath);
        }
    }

    authenticatedView(userName: string, profilePath: string, logoutPath: { pathname: string, state: { local: boolean } }) {
        return (<Fragment>
            <Nav.Item>
                <Nav.Link as={Link} to={profilePath} eventKey="profile">Hello {userName}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to={logoutPath} eventKey="logout">Logout</Nav.Link>
            </Nav.Item>
        </Fragment>);

    }

    anonymousView(registerPath: string, loginPath: string) {
        return (<Fragment>
            <Nav.Item>
                <Nav.Link as={Link} to={registerPath} eventKey="register">Register</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to={loginPath} eventKey="login">Login</Nav.Link>
            </Nav.Item>
        </Fragment>);
    }
}
