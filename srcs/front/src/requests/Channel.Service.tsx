import axios from "axios";
import { getServerIP } from '../utils/utils';

axios.defaults.baseURL = getServerIP(3000);
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

export async function getChannelList() {
  try {

    const response = await axios.get('/chats', {
      responseType: 'json',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    });

    const { channels } = response.data;
    return channels;
  } catch (error) {
    console.log('Error: Could not get the ChannelList', error);
  }
}

export async function createChannel(channelName: string, password: string) {
  const response = await axios.post('/chat/channels', {
    name: channelName,
    password: password
  }, {
    responseType: 'json',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Request failed with status ' + response.status);
  }

  const { id } = response.data;
  return { id: id, notif: "Canal creado correctamente" };
}

// export async function editChannel(id: number, newChannelName: string, newPassword: string) {
//   try {
//     const response = await axios.put('/chat/channels', {
//       id: id,
//       name: newChannelName,
//       password: newPassword
//     }, {
//       responseType: 'json',
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('token'),
//       },
//     });

//     if (response.status !== 200 && response.status !== 201) {
//       throw new Error('Request failed with status ' + response.status);
//     }

//     return true;

//   } catch (error) {
//     console.log('Error: Could not create the channel', error);
//     return false;
//   }
// }

// export async function deleteChannel(id: number, password: string) {
//   try {
//     const response = await axios.delete('/chat/channels', {
//       data: {
//         id: id,
//         password: password
//       },
//       responseType: 'json',
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('token'),
//       },
//     });

//     // Errores para el caso de contrasena incorrecta
//     if (response.status !== 200 && response.status !== 201) {
//       throw new Error('Request failed with status ' + response.status);
//     }

//     return true;

//   } catch (error) {
//     console.log('Error: Could not create the channel', error);
//     return false;
//   }
// }

export async function joinChannel(name: string, password: string) {

  try {
    const response = await axios.post('/chat/channels/join', {
      name: name,
      password: password
    }, {
      responseType: 'json',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    });


    // Errores para el caso de contrasena incorrecta o el canal no existe?
    if (response.status !== 200 && response.status !== 201) {
      throw new Error('Request failed with status ' + response.status);
    }

    const { channelId } = response.data;
    return { channelId: channelId, notif: "Has entrado al canal!" };
  } catch (error) {
    console.log('Error: Could not create the channel', error);
    return { channelId: -1, notif: "No has podido entrar al canal" };
  }
}

export async function leaveChannel(id: number) {
  try {
    const response = await axios.delete('/chat/channels/leave', {
      data: {
        id: id
      },
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
    console.log('Error: Could not create the channel', error);
    return false;
  }
}

// export async function editPermsChannel(id: number, name: string, setOwner: boolean, setAdmin: boolean) {
//   try {
//     // Tengo que obtener la lista y editar los datos? O funciona como un mapa y lo puedo editar directamente?
//     const response = await axios.put('/chat/channels/users', {
//       data: {
//         id: id,
//         user_id: name,
//         isOwner: setOwner,
//         isAdmin: setAdmin
//       },
//       responseType: 'json',
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('token'),
//       },
//     });

//     if (response.status !== 200 && response.status !== 201) {
//       throw new Error('Request failed with status ' + response.status);
//     }

//     return true;

//   } catch (error) {
//     console.log('Error: Could not create the channel', error);
//     return false;
//   }
// }

// export async function modChannel(id: number, name: string, setBan: boolean, setMute: number) {
//   try {
//     const response = await axios.put('/chat/channels/leave', {
//       data: {
//         id: id,
//         user_id: name,
//         isBanned: setBan,
//         isMuteSecs: setMute
//       },
//       responseType: 'json',
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('token'),
//       },
//     });

//     if (response.status !== 200 && response.status !== 201) {
//       throw new Error('Request failed with status ' + response.status);
//     }

//     return true;

//   } catch (error) {
//     console.log('Error: Could not create the channel', error);
//     return false;
//   }
// }
