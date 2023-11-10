import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendDuelUser } from '../../requests/GameData.Service';

interface PlayButtonProps {
  friendGameId: number;
  gamemode: boolean;
}

function B_PlayFriends({ friendGameId, gamemode }: PlayButtonProps) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const isButtonDisabled = friendGameId === -1;

    const Body: React.CSSProperties = {
        flex: 1,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    }

    const Button: React.CSSProperties = {
      width: '200px',
      height: '50px',
      borderRadius: '30px',
      fontStyle: 'normal',
      fontFamily: "'Press Start 2P'",
      fontSize: '18px',
      color: 'white',
      textShadow: '2px 2px 0px rgba(0, 0, 0, 0.4)',
      background: isButtonDisabled 
        ? 'rgba(70,140,70,0.3)'
        : (isHovered
            ? 'linear-gradient(0deg, rgba(70,140,70,0.7) 0%, rgba(108,217,108,0.7) 100%)'
            : 'linear-gradient(0deg, rgba(70,140,70,1) 0%, rgba(108,217,108,1) 100%)'),
      border: isHovered && !isButtonDisabled
        ? '3px solid rgba(255,255,255,0.7)'
        : 'none',
    }

    const handleMouseEnter = () => {
      setIsHovered(true);
    };
  
    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const CustomRedirect = async () => {
      if (friendGameId === -2) { 
        if (!gamemode)
          navigate('/pong');
        else
          navigate('/pong-alter');
      }
      else if (!isButtonDisabled) {
        await sendDuelUser(friendGameId, gamemode);
        if (!gamemode)
          navigate('/pong/' + friendGameId);
        else
          navigate('/pong-alter/' + friendGameId);
    }
    };

    return (
      <div style={Body}>
          <button style={Button}
            onClick={CustomRedirect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            disabled={isButtonDisabled} 
          >JUGAR</button>
      </div>
    );
}

export default B_PlayFriends;
