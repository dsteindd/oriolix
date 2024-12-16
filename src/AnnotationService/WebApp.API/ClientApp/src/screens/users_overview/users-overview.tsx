import React, {useEffect, useState} from 'react';
import authService from '../../components/api-authorization/AuthorizeService';
import {User} from '../../models/user';
import {adminService} from '../../services/ApiService';
import {UsersList} from "./users-list";

interface IState {
    loading: boolean,
    users: User[]
}

export const UsersOverview = () => {

    const [state, setState] = useState<IState>({
        loading: true,
        users: []
    })

    const _fetchUsers = async (): Promise<User[]> => {
        const token = await authService.getAccessToken();
        var response = await adminService.getUsers(token!);

        return response;
    }
    
    
    useEffect(() => {
        _fetchUsers().then(users => {
            setState({
                loading: false,
                users: users
            })
        })
    }, [])

    // const _buildRow = (user: User) => {
    //
    //     return (
    //         <User
    //         // <tr key={user.id}>
    //         //     <td className='text-center text-justify'>
    //         //         {user.mail}
    //         //     </td>
    //         //     <td className='text-center text-justify'>
    //         //         <a href={`mailto:${user.mail}?subject=Subject`}>
    //         //             <Button onClick={() => console.log("Clicked")}>Send Mail</Button>
    //         //         </a>
    //         //
    //         //     </td>
    //         //     <td>
    //         //         {user.roles.join(", ")}
    //         //     </td>
    //         // </tr>
    //     )
    // }
    console.log(state)

    if (state.loading) {
        return (
            <p><em>Loading...</em></p>
        )
    }

    return (
        <UsersList 
            users={state.users} 
            handleAdminRoleSwitch={async (userId, shouldBeAdmin) => {
                const token = await authService.getAccessToken();
                await adminService.changeAdminUserRole(token, userId, shouldBeAdmin);
                setState({
                    loading: true,
                    users: []
                })
                _fetchUsers().then(users => {
                    setState({
                        loading: false,
                        users: users
                    })
                })
                
            }}/>
    )


}