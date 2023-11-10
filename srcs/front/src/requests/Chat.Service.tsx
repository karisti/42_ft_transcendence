import axios from "axios";
import { getServerIP } from '../utils/utils';

axios.defaults.baseURL = getServerIP(3000);
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

export async function getChatDirect(chatId: number) {
    try {
        const response = await axios.get('/chat/directs?userId=' + chatId, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        
        return response.data;

    } catch (error) {
        console.log('User does not exist ', error);
        return [];
    }
}

export async function sendDirectMessage(id: number, content: string) {
    try {
        const response = await axios.post('/chat/directs/message', {
            user_id: id,
            message: content
        }, {
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

// -------------------- CHANNEL ---------------------------

export async function getChatChannel(chatId: number) {
    try {
        const response = await axios.get('/chat/channels?channelId=' + chatId, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200 && response.status !== 201) {
            throw new Error('Could not join the channel ' + response.status);
        }

        return response.data;

    } catch (error) {
        console.log('Error: Could not join that channel', error);
        return [];
    }
}

export async function sendChannelMessage(id: number, content: string) {
    try {
        const response = await axios.post('/chat/channels/message', {
            channel_id: id,
            message: content
        }, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200 && response.status !== 201) {
            throw new Error('Request failed with status ' + response.status);
        }

        return response.data;

    } catch (error) {
        console.log('Error: Could not send the message', error);
        return null;
    }
}
