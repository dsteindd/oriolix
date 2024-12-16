import React, {Component, Suspense} from 'react';
import {Navigate, Route, Routes} from 'react-router';
import {Layout} from './components/layout/Layout';
import FileOverview from './screens/audio-overview/audio-overview';
import ApiAuthorizationRoutes from './components/api-authorization/ApiAuthorizationRoutes';

import './custom.css'
import {AddAudioScreen} from './screens/add_audio/add-audio-screen';
import {UsersOverview} from './screens/users_overview/users-overview';
import {ProjectOverview} from "./screens/project-overview/project-overview";
import {AddProjectScreen} from "./screens/add-project/add-project-screen";
import {LabelSetOverview} from "./screens/label-sets/label-set-overview";
import {AddLabelSetScreen} from "./screens/add-label-set/add-label-set";

import {EditProject} from "./screens/edit-project/edit-project";
import authService, {Roles} from "./components/api-authorization/AuthorizeService";
import ProtectedRoute from "./components/api-authorization/ProtectedRoute";
import {Licenses} from "./screens/license-page/license-page";
import {getLicenses} from "./licenses";

const FileDetails = React.lazy(() => import('./screens/audio-details/file-details-screen')
    .then(module => ({default: module.FileDetails})))


interface IAuthenticationState {
    ready: boolean,
    authenticated: boolean,
    roles: string[]
}


export default class App extends Component<null, IAuthenticationState> {
    static displayName = App.name;

    private _subscription: number | undefined;

    constructor(props: null) {
        super(props);

        this.state = {
            ready: false,
            authenticated: false,
            roles: []
        };
    }

    componentDidMount() {
        this._subscription = authService.subscribe(() => this.authenticationChanged());
        this.populateAuthenticationState();
    }

    componentWillUnmount() {
        authService.unsubscribe(this._subscription!);
    }

    async populateAuthenticationState() {
        const [authenticated, roles] = await Promise.all([authService.isAuthenticated(), authService.getRoles()])
        this.setState({
            ready: true,
            authenticated,
            roles
        });
    }

    async authenticationChanged() {
        this.setState({ready: false, authenticated: false, roles: []});
        await this.populateAuthenticationState();
    }


    render() {
        return (
            <Layout>
                <Suspense fallback={<p>Loading Page</p>}>
                    <Routes>
                        <Route
                            element={
                            <ProtectedRoute
                                path="projects"
                                isAllowed={this.state.authenticated}
                                isAuthenticated={this.state.authenticated}
                                ready={this.state.ready}
                            />
                        }>
                            <Route path="/projects" element={<ProjectOverview/>}/>
                            <Route path='/projects/:projectId/files/*' element={<FileOverview/>}/>
                            <Route path='/add-project'
                                   element={<AddProjectScreen/>}/>
                            <Route path='/label-sets/*'
                                   element={<LabelSetOverview/>}/>
                            <Route path='/add-label-set'
                                   element={<AddLabelSetScreen/>}/>
                            <Route path='/projects/:projectId/files/:id' element={<FileDetails/>}/>
                            <Route path='/projects/:projectId/add-file' element={<AddAudioScreen/>}/>
                            <Route path='/projects/:projectId/edit' element={<EditProject/>}/>
                            <Route path='/' element={<Navigate to='/projects'/>}/>
                        </Route>
                        <Route element={
                            <ProtectedRoute
                                path="/projects"
                                isAllowed={this.state.roles.includes(Roles.Admin)}
                                isAuthenticated={this.state.authenticated}
                                ready={this.state.ready}/>
                        }>
                            <Route path='/users'
                                   element={<UsersOverview/>}/>
                        </Route>
                        
                        <Route path='/*' element={<ApiAuthorizationRoutes/>}/>
                        <Route path='/licenses' element={<Licenses licenses={getLicenses()}/>}/>
                        
                    </Routes>
                </Suspense>
            </Layout>
        );
    }
}
