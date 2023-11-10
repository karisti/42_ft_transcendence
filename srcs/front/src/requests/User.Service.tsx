import axios from "axios";
import { getServerIP } from '../utils/utils';

axios.defaults.baseURL = getServerIP(3000);
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

export async function updateUserProfile(username: string, image: File | null) {
  const formData = new FormData();
  formData.append('nick', username);
  if (image) {
    formData.append('file', image);
  }

  try {
    const response = await axios.put('/users/profile', formData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });

    if (response.status === 200) {
      console.log('Changes applied successfully');
      return true;
    } else {
      console.log('Failed to apply changes');
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

export async function getUserProfile() {
    const response = await axios.get('users/profile', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });

    if (response.status !== 200) {
      throw new Error('Request failed with status ' + response.status);
    }

    const fetchedName = response.data.nick;
    const fetchedAdminSite = response.data.isSiteAdmin;
    let fetchedImage = response.data.avatarUri;

    let imageResponse;

    if (fetchedImage.includes('https://cdn.intra.42.fr/users/')) {

      const authorization = axios.defaults.headers.common["Authorization"];
      delete axios.defaults.headers.common["Authorization"];

      imageResponse = await axios.get(fetchedImage, {
        responseType: 'blob',
        headers: {
          'Accept': 'image/avif,image/webp,image/apng'
        },
      });

      axios.defaults.headers.common["Authorization"] = authorization;

    } else {

      fetchedImage = '/uploads/avatars/' + fetchedImage;
      imageResponse = await axios.get(fetchedImage, {
        responseType: 'blob',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
    }

    if (imageResponse.status !== 200) {
      throw new Error('Request failed with status ' + imageResponse.status);
    }

    const imageURL = URL.createObjectURL(imageResponse.data);

    return { username: fetchedName, userImage: imageURL, siteAdmin: fetchedAdminSite };
}

export async function deleteAvatarProfile() {
  try {
    const response = await axios.delete('users/profile', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });

    if (response.status !== 200) {
      console.log('Failed to delete avatar');
      return null;
    }

    console.log('Avatar deleted successfully');
    const fetchedImage = response.data.avatarUri;

    const imageResponse = await axios.get('uploads/avatars/' + fetchedImage, {
      responseType: 'blob',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });

    if (imageResponse.status !== 200) {
      throw new Error('Request failed with status ' + imageResponse.status);
    }

    const imageURL = URL.createObjectURL(imageResponse.data);

    return imageURL;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getUserImage(URI: string) {
  try {
    let fetchedImage = URI;

    let imageResponse;

    if (fetchedImage.includes('https://cdn.intra.42.fr/users/')) {

      const authorization = axios.defaults.headers.common["Authorization"];
      delete axios.defaults.headers.common["Authorization"];

      imageResponse = await axios.get(fetchedImage, {
        responseType: 'blob',
        headers: {
          'Accept': 'image/avif,image/webp,image/apng'
        },
      });

      axios.defaults.headers.common["Authorization"] = authorization;

    } else {

      fetchedImage = '/uploads/avatars/' + fetchedImage;
      imageResponse = await axios.get(fetchedImage, {
        responseType: 'blob',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
    }

    if (imageResponse.status !== 200) {
      throw new Error('Request failed with status ' + imageResponse.status);
    }

    const imageURL = URL.createObjectURL(imageResponse.data);

    return imageURL;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// export async function get2FAuthUser() {
//   try {
//     const token = localStorage.getItem('token');
//     const response = await axios.get<{ checkresult: boolean }>(getServerIP(3000) + 'auth/second-auth-factor/check', {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });

//     return response.data.checkresult;

//   } catch (error) {
//     console.error('Error checking 2FA status:', error);
//     return false;
//   }
// }

export async function get2FAuthUserVerification(code: string, userId: number) {
  console.log(code);
  console.log(userId);
  try {
    const response = await axios.post('auth/second-auth-factor/verify', { code: code, userId: userId }, {
      responseType: 'json',
  });

  if (response.status !== 200 && response.status !== 201) {
    return {URL: '', error: true};
  }

  return {URL: response.data.redirectUrl, error: false};

  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return {URL: '', error: true};
  }
}

export async function get2FAuthUserVerificationRemove() {
  try {
    const response = await axios.delete('auth/second-auth-factor/verified', {
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
    console.error('Error checking 2FA status:', error);
    return false;
  }
}