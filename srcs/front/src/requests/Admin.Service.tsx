import axios from "axios";
import { getServerIP } from '../utils/utils';

axios.defaults.baseURL = getServerIP(3000);
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');


export async function sendAdminCommand(content: string) {
    try {
        const response = await axios.post('/admin/message', {
            message: content
        }, {
            responseType: 'json',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        });

        if (response.status !== 200 && response.status !== 201) {
            return { msg: response.data.response, error: response.data.error}
        }

        return { msg: response.data.response, error: response.data.error}

    } catch (error) {
        console.log('Error', error);
        return { msg: 'No se ha podido ejecutar el comando', error: true}
    }
}
