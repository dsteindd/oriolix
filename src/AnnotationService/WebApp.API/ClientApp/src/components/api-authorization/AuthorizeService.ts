import {User, UserManager, WebStorageStateStore} from 'oidc-client';
import {ApplicationName, ApplicationPaths} from './ApiAuthorizationConstants';
import {Failure, Redirect, SignInResult, SignoutResult, Success} from './AuthorizationTypes';

interface Callback {
    callback: () => void,
    subscription: number
}

export class Roles {
    static Admin = "Admin"
    static User = "User"
}

const RoleClaim = "role";

export class AuthorizeService {
    _callbacks: Callback[] = [];
    _nextSubscriptionId = 0;
    _user: User | undefined | null = null;
    _isAuthenticated = false;

    userManager: UserManager | undefined;

    // By default pop ups are disabled because they don't work properly on Edge.
    // If you want to enable pop up authentication simply set this flag to false.
    _popUpDisabled = true;

    static get instance() {
        return authService
    }

    async isAuthenticated() {
        const user = await this.getUser();
        return !!user;
    }
    
    async getRoles(){
        if (this._user && this._user.profile) {
            return this._user.profile[RoleClaim];
        }

        await this.ensureUserManagerInitialized();
        const user = await this.userManager!.getUser();

        if (user?.profile?.role) {
            return user.profile.role;
        }
        return [];
    }

    async isAdmin() {
        if (this._user && this._user.profile) {
            return this._user.profile[RoleClaim] === Roles.Admin;
        }

        await this.ensureUserManagerInitialized();
        const user = await this.userManager!.getUser();

        if (user?.profile?.role) {
            return user.profile.role === Roles.Admin;
        }
        return false;
    }

    async getUser() {
        if (this._user && this._user.profile) {
            return this._user.profile;
        }


        await this.ensureUserManagerInitialized();
        const user = await this.userManager!.getUser();
        return user && user.profile;
    }

    // We try to authenticate the user in three different ways:
    // 1) We try to see if we can authenticate the user silently. This happens
    //    when the user is already logged in on the IdP and is done using a hidden iframe
    //    on the client.
    // 2) We try to authenticate the user using a PopUp Window. This might fail if there is a
    //    Pop-Up blocker or the user has disabled PopUps.
    // 3) If the two methods above fail, we redirect the browser to the IdP to perform a traditional

    async getAccessToken(): Promise<string | null> {
        await this.ensureUserManagerInitialized();
        const user = await this.userManager!.getUser();
        return user && user.access_token;
    }

    //    redirect flow.
    async signIn(state: any): Promise<SignInResult> {
        await this.ensureUserManagerInitialized();
        try {
            const silentUser = await this.userManager!.signinSilent(this.createArguments());
            this.updateState(silentUser);
            return this.success(state);
        } catch (silentError) {
            // User might not be authenticated, fallback to popup authentication
            console.log("Silent authentication error: ", silentError);

            try {
                if (this._popUpDisabled) {
                    throw new Error('Popup disabled. Change \'AuthorizeService.js:AuthorizeService._popupDisabled\' to false to enable it.')
                }

                const popUpUser: User = await this.userManager!.signinPopup(this.createArguments());
                this.updateState(popUpUser);
                return this.success(state);
            } catch (popUpError: any) {
                if (popUpError.message === "Popup window closed") {
                    // The user explicitly cancelled the login action by closing an opened popup.
                    return this.error("The user closed the window.");
                } else if (!this._popUpDisabled) {
                    console.log("Popup authentication error: ", popUpError);
                }

                // PopUps might be blocked by the user, fallback to redirect
                try {
                    await this.userManager!.signinRedirect(this.createArguments(state));
                    return this.redirect();
                } catch (redirectError) {
                    console.log("Redirect authentication error: ", redirectError);
                    return this.error(redirectError);
                }
            }
        }
    }

    // We try to sign out the user in two different ways:
    // 1) We try to do a sign-out using a PopUp Window. This might fail if there is a
    //    Pop-Up blocker or the user has disabled PopUps.
    // 2) If the method above fails, we redirect the browser to the IdP to perform a traditional

    async completeSignIn(url: string): Promise<Success | Failure> {
        try {
            await this.ensureUserManagerInitialized();
            const user = await this.userManager!.signinCallback(url);
            this.updateState(user);
            return this.success(user && user.state);
        } catch (error) {
            return this.error('There was an error signing in.');
        }
    }

    //    post logout redirect flow.
    async signOut(state: any): Promise<SignoutResult> {
        await this.ensureUserManagerInitialized();
        try {
            if (this._popUpDisabled) {
                throw new Error('Popup disabled. Change \'AuthorizeService.js:AuthorizeService._popupDisabled\' to false to enable it.')
            }

            await this.userManager!.signoutPopup(this.createArguments());
            this.updateState(undefined);
            return this.success(state);
        } catch (popupSignOutError) {
            try {
                await this.userManager!.signoutRedirect(this.createArguments(state));
                return this.redirect();
            } catch (redirectSignOutError) {
                return this.error(redirectSignOutError);
            }
        }
    }

    async completeSignOut(url: string): Promise<{ status: string, message: string } | { status: string, state: any }> {
        await this.ensureUserManagerInitialized();
        try {
            const response: any = await this.userManager!.signoutCallback(url);
            this.updateState(null);
            return this.success(response && response.data);
        } catch (error) {
            console.log(`There was an error trying to log out '${error}'.`);
            return this.error(error);
        }
    }

    updateState(user: User | null | undefined) {
        this._user = user;
        this._isAuthenticated = !!this._user;
        this.notifySubscribers();
    }

    subscribe(callback: () => void) {
        this._callbacks.push({callback, subscription: this._nextSubscriptionId++});
        return this._nextSubscriptionId - 1;
    }

    unsubscribe(subscriptionId: number) {
        const subscriptionIndex: { found: boolean, index?: number | undefined }[] = this._callbacks
            .map((element, index) => element.subscription === subscriptionId ? {found: true, index} : {found: false})
            .filter(element => element.found);
        if (subscriptionIndex.length !== 1) {
            throw new Error(`Found an invalid number of subscriptions ${subscriptionIndex.length}`);
        }

        this._callbacks.splice(subscriptionIndex[0].index!, 1);
    }

    notifySubscribers() {
        for (let i = 0; i < this._callbacks.length; i++) {
            const callback = this._callbacks[i].callback;
            callback();
        }
    }

    createArguments(state: any = null): any {
        return {useReplaceToNavigate: true, data: state};
    }

    error(message: any): Failure {
        return {status: "fail", message};
    }

    success(state: string): Success {
        return {status: "success", state};
    }

    redirect(): Redirect {
        return {status: "redirect"};
    }

    async ensureUserManagerInitialized() {
        if (this.userManager !== undefined) {
            return;
        }

        const response = await fetch(ApplicationPaths.ApiAuthorizationClientConfigurationUrl);
        if (!response.ok) {
            throw new Error(`Could not load settings for '${ApplicationName}'`);
        }

        const settings = await response.json();
        settings.automaticSilentRenew = true;
        settings.includeIdTokenInSilentRenew = true;
        settings.userStore = new WebStorageStateStore({
            prefix: ApplicationName
        });

        this.userManager = new UserManager(settings);

        this.userManager.events.addUserSignedOut(async () => {
            await this.userManager!.removeUser();
            this.updateState(undefined);
        });
    }
}

const authService: AuthorizeService = new AuthorizeService();

export default authService;

export const AuthenticationResultStatus = {
    Redirect: 'redirect',
    Success: 'success',
    Fail: 'fail'
};
