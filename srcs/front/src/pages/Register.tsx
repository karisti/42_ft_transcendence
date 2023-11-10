import React, { useEffect, useState } from "react";
import UserSettingsButtons from "../components/settings/UserSettingsButtons";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { } from "../requests/User.Service";
import VerificationInput from '../components/2AF/VerificationInput';

function Register() {
  const [ready, setReady] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!verificationPassed)  // SI NO PONE CODIGO 2FA Y HACE F5 HACE SKIP
      navigate('/register');

  }, [verificationPassed]);

  useEffect(() => {
    if (searchParams.has("token")) {
      const token = searchParams.get("token");
      if (token) {
        localStorage.setItem('token', token);
        searchParams.delete("token");
        setSearchParams(searchParams);
        setReady(true);
      }
    } else {
      setReady(true);
    }
  }, [searchParams, setSearchParams]);


  // useEffect(() => {
  //   const check2AFOnLoad = async () => {
  //     setSecondFactor(await get2FAuthUser());
  //   };

  //   check2AFOnLoad();
  // }, []);

  const NicknamePositionStyle: React.CSSProperties = {
    height: '320px',
    width: '100%',
    top: '320px',
    backgroundColor: '#01624',
  };

  const NicknameTapeStyle: React.CSSProperties = {
    height: '170%',
    width: '100%',
    top: '50%',
    backgroundColor: '#1c2c49',
    position: 'relative',
  };

  const TitleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontFamily: "'Press Start 2P'",
    fontSize: '40px',
    top: '2%',
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
    left: '0%',
  };

  const SubtitleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontFamily: "'Press Start 2P'",
    fontSize: '20px',
    top: '22%',
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
    left: '0%',

  };

  const NicknameInputStyle: React.CSSProperties = {
    height: '58%',
    width: '40%',
    left: '28%',
    top: '40%',
    position: 'relative',
  };

  return (
    ready
      ? (
        <div style={NicknamePositionStyle}>
          <div style={NicknameTapeStyle}>
            <h1 style={TitleStyle}>Elige un nick</h1>
            <div style={SubtitleStyle}>Normas del nick:
              <p style={{ fontSize: '13px' }}> - La longitud debe ser entre 3 y 10 caráctares </p>
              <p style={{ fontSize: '13px' }}> - Puede ser alfanumérico y contener '_' o '-' </p>
            </div>
            <div style={NicknameInputStyle}>
              <section>
                <UserSettingsButtons btnTxt="Registrarse"></UserSettingsButtons>
              </section>
            </div>
          </div>
        </div>
      )
      : <div>Loading...</div>
  );
}

export default Register;
