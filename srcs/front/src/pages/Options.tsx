import React, { useState, useEffect } from "react";
import axios from 'axios';
import HomeButton from "../components/B_Home";
import UserSettingsButtons from "../components/settings/UserSettingsButtons";
import QRCodeDisplay from "../components/2AF/QRCodeDisplay";
import { getServerIP } from '../utils/utils';

axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');

function Options() {
  const [is2AFActive, setIs2AFACtive] = useState(false);

  useEffect(() => {
    const check2AFOnLoad = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<{ checkresult: boolean }>(getServerIP(3000) + 'auth/second-auth-factor/check', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIs2AFACtive(response.data.checkresult);
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      }
    };

    check2AFOnLoad();
  }, []);

  const handleToggle2AF = async () => {
    if (is2AFActive) {
      try {
        const token = localStorage.getItem('token');
        await axios.get<string>(getServerIP(3000) + 'auth/second-auth-factor/disable', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("2AF disabled");
      } catch (error) {
        console.error('Error disabling 2FA:', error);
      }
    }
    setIs2AFACtive(!is2AFActive);
  };

  const NicknamePositionStyle: React.CSSProperties = {
    height: '320px',
    width: '100%',
    top: '320px',
    backgroundColor: '#01624',
  };

  const NicknameTapeStyle: React.CSSProperties = {
    height: '150%',
    width: '100%',
    top: '50%',
    backgroundColor: '#1c2c49',
    position: 'relative',
  };

  const TitleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontFamily: "'Press Start 2P'",
    fontSize: '40px',
    top: '-25%',
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
    left: '0%',
  };

  const NicknameInputStyle: React.CSSProperties = {
    height: '66%',
    width: '40%',
    top: '32%',
    left: '28%',
    position: 'absolute',
  };

  const Active2FAStyle: React.CSSProperties = {
    position: 'absolute',
    width: '150px',
    background: 'none'
  };

  const FlexContainerStyle: React.CSSProperties = {
    display: 'absolute',
    marginLeft: '800px',
    marginBottom: '50px'
  };

  const ButtonStyle: React.CSSProperties = {
    fontFamily: 'Quantico',
		backgroundColor: '#ccb862',
		fontSize: '12px',
		fontWeight: 'bold',
		border: 'none',
		borderRadius: '5px',
		padding: '10px 10px',
		cursor: 'pointer',
		width: '110px',
  };

  return (
    <div className="Register">
      <HomeButton></HomeButton>
      <div className="NicknamePositionWrapper" style={NicknamePositionStyle}>
        <div className="NicknameTapeWrapper" style={NicknameTapeStyle}>
          <div className="NicknameInputWrapper" style={NicknameInputStyle}>
            <div className="TitleText" style={TitleStyle}>
              Editar Perfil
            </div>
            <div style={FlexContainerStyle}>
              <section className="OptionsMenu">
                <UserSettingsButtons btnTxt="Aplicar"></UserSettingsButtons>
              </section>
              <div style={Active2FAStyle}>
                <button style={ButtonStyle} onClick={handleToggle2AF}>
                  {is2AFActive ? "Desactivar 2FA" : "Activar 2FA"}
                </button>
                {is2AFActive && <QRCodeDisplay />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options;
