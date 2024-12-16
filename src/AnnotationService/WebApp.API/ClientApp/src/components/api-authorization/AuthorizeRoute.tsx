import React, {Component} from 'react'
import {Navigate} from 'react-router';
import {ApplicationPaths, QueryParameterNames} from './ApiAuthorizationConstants'
import authService from './AuthorizeService'

interface IState {
    ready: boolean,
    authenticated: boolean,
    isAdmin: boolean
}

interface IProps {
    path: string,
    component: any,
    requiresAdmin?: boolean
}


export default class AuthorizeRoute extends Component<IProps, IState> {

    private _subscription: number | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            ready: false,
            authenticated: false,
            isAdmin: false
        };
    }

    componentDidMount() {
        this._subscription = authService.subscribe(() => this.authenticationChanged());
        this.populateAuthenticationState();
    }

    componentWillUnmount() {
        authService.unsubscribe(this._subscription!);
    }

    render() {
        const {ready, authenticated, isAdmin} = this.state;
        const link = document.createElement("a");
        link.href = this.props.path;
        const returnUrl = `${link.protocol}//${link.host}${link.pathname}${link.search}${link.hash}`;
        const redirectUrl = `${ApplicationPaths.Login}?${QueryParameterNames.ReturnUrl}=${encodeURIComponent(returnUrl)}`
        if (!ready) {
            return <div></div>;
        } else {
            const {component: Component} = this.props;
            let nextComponent;
            if (authenticated && ((!this.props.requiresAdmin) || (this.props.requiresAdmin && isAdmin))) {
                nextComponent = <Component {...this.props} />
            } else if (authenticated && (this.props.requiresAdmin && !this.state.isAdmin)) {
                nextComponent = (
                    <div>
                        You are forbidden to view this page!
                    </div>
                )
            } else {
                nextComponent = <Navigate to={redirectUrl}/>
            }
            return nextComponent;
        }
    }

    // renderChildOrNavigate(authenticated: boolean, redirectUrl: string) {
    //
    // }

    async populateAuthenticationState() {
        const [authenticated, isAdmin] = await Promise.all([authService.isAuthenticated(), authService.isAdmin()]);
        this.setState({
            ready: true,
            authenticated,
            isAdmin
        });
    }

    async authenticationChanged() {
        this.setState({ready: false, authenticated: false, isAdmin: false});
        await this.populateAuthenticationState();
    }
}
