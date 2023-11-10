import React, { useEffect, useState } from 'react';
import HomeButton from "../components/B_Home";
import PlayButton from "../components/gameSelector/B_PlayFriends";
import SocialMenu from "../components/chat-friend-menu/SocialMenu";
import { getFriendList } from '../requests/Friend.Service';
import { getUserImage } from '../requests/User.Service';

interface Friend {
    userId: number;
    nick: string;
    avatarUri: string;
    isOnline: boolean;
    isInGame: boolean;
    avatarFile?: string | null;
}

function GameSelector() {
    const [isOriginal, setisOriginal] = useState(false);


    //<<< STYLES >>>//
    const MainContainer: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    }

    const Content: React.CSSProperties = {
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '300px',
        position: 'relative',
    }

    const Box: React.CSSProperties = {
        width: '940px',
        height: '620px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '15px',
        background: '#4C5970',
    }

    const ButtonHeader: React.CSSProperties = {
        width: '100%',
        height: '100px',
        display: 'flex',
    }

    const Button: React.CSSProperties = {
        width: '50%',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
        fontFamily: "'Press Start 2P'",
        color: 'white',
        background: isOriginal
            ? 'rgba(0,0,0,0.2)'
            : 'rgba(0,0,0,0)',
    }

    const ButtonAlt: React.CSSProperties = {
        width: '50%',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
        fontFamily: "'Press Start 2P'",
        color: 'white',
        background: isOriginal
            ? 'rgba(0,0,0,0)'
            : 'rgba(0,0,0,0.2)',
    }

    const SectionStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: '4%',
        marginLeft: '9%',
        width: '66%',
    }

    const friendContainerStyle: React.CSSProperties = {
        width: '100px',
        height: '130px',
        marginBottom: '40%',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.3s ease-in-out, background-color 0.3s ease',
    };

    const avatarWrapperStyle: React.CSSProperties = {
        width: '100px',
        height: '130px',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out, background-color 0.8s ease',
    };

    const avatarStyle: React.CSSProperties = {
        width: '80px',
        height: '80px',
        marginTop: '25%',
        borderRadius: '50%',
    };

    const nameStyle: React.CSSProperties = {
        marginTop: '10px',
        fontSize: '20px',
        color: '#c0c0c0',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '10px'
    };

    const infoText: React.CSSProperties = {
        textAlign: 'center',
        margin: '80px 20px',
        fontFamily: 'Quantico',
        color: 'white',
    };


    //<<< FUNCTIONS >>>//
    const changeCustom = () => {
        if (isOriginal === true)
            setisOriginal(false);
    }

    const changeOriginal = () => {
        if (isOriginal === false)
            setisOriginal(true);
    }


    //<<< BUILD >>>//
    return (
        <div style={MainContainer}>
            <div style={Content}>
                <HomeButton></HomeButton>
                <div style={Box}>
                    <div className='ButtonHeader' style={ButtonHeader}>
                        <div className='OriginalButton' style={Button} onClick={changeCustom}>ORIGINAL</div>
                        <div className='CustomButton' style={ButtonAlt} onClick={changeOriginal}>ALTERNATIVO</div>
                    </div>
                    { !isOriginal 
                        ? <h1 style={infoText}>Mueve tu pala y golpea la pelota<br /> para intentar marcar a tu oponente<br /> evita que la pelota pase de tu pala.<br /> Mueve la pala con las flechas ↑ ↓<br /><br />Gana el primero que consiga 3 puntos</h1>
                        : <h1 style={infoText}>En este modo de juego<br /> se añade una pelota roja,<br /> si se marca otorga 2 puntos<br />Mueve la pala con las flechas ↑ ↓<br /><br />Gana el primero que consiga 3 puntos</h1>
                    }
                    <PlayButton friendGameId={-2} gamemode={isOriginal}></PlayButton>
                    <div className='CustomContent'>
                    </div>
                </div>
            </div>
            <SocialMenu></SocialMenu>
        </div>
    );
}

export default GameSelector;
