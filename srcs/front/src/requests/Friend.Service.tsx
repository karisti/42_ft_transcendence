import axios from "axios";
import { getServerIP } from '../utils/utils';

axios.defaults.baseURL = getServerIP(3000);
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');


export async function getUsersList() {
    try {
        const response = await axios.get('users/all', {
            headers: {
                responseType: 'json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200) {
            throw new Error('Request failed with status ' + response.status);
        }

        const usersList = response.data;

        return { users: usersList };

    } catch (error) {
        console.log('Error:', error);
        return { users: [] };
    }
}

// Obtiene la solicitud de los amigos
export async function getFriendList() {
    try {
        const response = await axios.get('users/friends', {
            headers: {
                responseType: 'json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200) {
            throw new Error('Request failed with status ' + response.status);
        }

        const friendList = response.data;

        return { friends: friendList };

    } catch (error) {
        console.log('Error:', error);
        return { friends: [] };
    }
}

// Manda la solicitud de amigo
export async function addFriend(friendName: string) {
    try {
        const response = await axios.post('users/friends', { nick: friendName }, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200 && response.status !== 201) {
            throw new Error('Request failed with status ' + response.status);
        }

        return true;

    } catch (error) {
        console.log('Error: Could not add the friend', error);
        return false;
    }
}

// Borra a un amigo
export async function deleteFriend(friendName: string) {
    try {
        const response = await axios.delete('users/friends', {
            data: { nick: friendName },
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200 && response.status !== 201) {
            throw new Error('Request failed with status ' + response.status);
        }

        return true;

    } catch (error) {
        console.log('Error: Could not remove that friend', error);
        return false;
    }
}

// ----------------- PETICIONES AMIGO ------------------------------------

// Obtiene la lista de solicitudes de amigo
export async function getFriendRequests() {
    try {
        const response = await axios.get('users/friends/requests', {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        const friendList = response.data;

        return { friends: friendList };

    } catch (error) {
        console.log('Error: Could not remove that friend', error);
        return  { friends: [] };
    }
}

// Accepta la request de friendName
export async function updateFriendList(friendName: string) {
    try {
        const response = await axios.put('users/friends', { nick: friendName }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200) {
            throw new Error('Request failed with status ' + response.status);
        }

        return true;

    } catch (error) {
        console.log('Error: Could not remove that friend', error);
        return false;
    }
}

// --------------------- Canales/Directos/Bloqueados --------------------------

export async function getBlockedUsers() {
    try {
        const response = await axios.get('chats', {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        const { blocked_users } = response.data;
        return blocked_users;

    } catch (error) {
        console.log('Error: Could not remove that friend', error);
        return  [];
    }
}

export async function unblockUser(friendName: string) {
    try {
        const response = await axios.delete('users/blocks', {
            data: { nick: friendName },
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200 && response.status !== 201) {
            throw new Error('Request failed with status ' + response.status);
        }

        return true;

    } catch (error) {
        console.log('Error: Could not remove that user', error);
        return false;
    }
}

