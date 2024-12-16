// import {AuthenticationResultStatus} from './AuthorizeService';


export type Success = {
    status: 'success';
    state: string
}

export type Failure = {
    status: 'fail';
    message: string
}

export type Redirect = {
    status: 'redirect',
}

export type SignoutResult = Success | Failure | Redirect;

export type SignInResult = Success | Failure | Redirect;