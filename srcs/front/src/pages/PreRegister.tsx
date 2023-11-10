import React from "react";
import PlayButton from "../components/home/StartButton";
import axios from 'axios';
import Logo from '../assets/images/Logo.png';
import { getServerIP } from '../utils/utils';

function PreRegister() {
    const TitleText: React.CSSProperties = {
        color: 'white',
        fontFamily: "'Press Start 2P'",
        fontSize: '64px',
        fontWeight: 400,
        height: '150px',
        left: '50%',
        top: '25%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute'
      };

    const LogoImg: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    };
    
    const AuthLoginStyle: React.CSSProperties = {
        position: 'absolute',
        top: '80%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };

    const AuthLoginLink = async () => {
        try{
            const response = await axios.get(getServerIP(3000) + 'oauth/generateAuthURL');
            if (response.status === 200 || response.status === 201) {
                const authUrl = response.data.url;
                console.log(authUrl);
                window.location.href = authUrl;
            }
        } catch (error){
            console.log('Failed to retrieve OAuth URL: ', error);
        }
    };


    return (
        <div>
            <h1 className="TitleText" style={TitleText}>42PONG</h1>
            <img src={Logo} alt="Logo of 42Pong" style={LogoImg} />
            <section className='AuthLoginButton' style={AuthLoginStyle} onClick={AuthLoginLink}>
                <PlayButton name="LOGIN"/>
            </section>
        </div>
    );
}

export default PreRegister;
