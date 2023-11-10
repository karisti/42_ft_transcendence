import axios from "axios";
import { getServerIP } from '../utils/utils';

axios.defaults.baseURL = getServerIP(3000);
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

export async function getUserMatches(nickname: string) {
    try {
        const response = await axios.get('/profile/matches?nick=' + nickname, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        // FALTA MANEJO DE ERRORES
        if (response.status !== 200 && response.status !== 201) {
            return { data: null, msg: response.data.response, error: response.data.error }
        }

        return { data: response.data, msg: response.data.response, error: response.data.error}

    } catch (error) {
        console.log('Error', error);
        return { data: null, msg: 'Usuario no encontrado', error: true}
    }
}

export async function getLeaderboard() {
    try {
        const response = await axios.get('/game/ranking', {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        // FALTA MANEJO DE ERRORES
        if (response.status !== 200 && response.status !== 201) {
            return { data: [], error: true}
        }

        return { data: response.data, error: false}
    
    } catch (error) {
        console.log('Error', error);
        return { data: [], error: true}
    }
}

export async function sendDuelUser(id: number, gamemode: boolean) {
    try {
        const response = await axios.post('/game/duel',{ otherUserId: id, isOriginal: gamemode }, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        // FALTA MANEJO DE ERRORES
        if (response.status !== 200 && response.status !== 201) {
            return { data: [], error: true}
        }

        return { data: response.data, error: false}
    
    } catch (error) {
        console.log('Error', error);
        return { data: [], error: true}
    }
}