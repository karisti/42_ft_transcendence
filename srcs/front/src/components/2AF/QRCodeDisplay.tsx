import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getServerIP } from '../../utils/utils';

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

const QRCodeDisplay: React.FC = () => {
  const [qrCodeImage, setQRCodeImage] = useState<string>('');

  useEffect(() => {
      const enable2FA = async () => {
        try {
          const response = await axios.get<string>(getServerIP(3000) + 'auth/second-auth-factor/enable',{
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token'),
            }
          });
          setQRCodeImage(response.data);
          console.log(response.data);
        } catch (error) {
          console.error('Error enabling 2FA:', error);
        }
      };
      enable2FA();
  }, []);

  return (
    <div>
      <img src={qrCodeImage} alt={"Qr code"}/>
    </div>
  );
};

export default QRCodeDisplay;
