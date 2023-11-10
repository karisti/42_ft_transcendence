import React, { useState } from 'react';

interface Args{
    name: string;
    width: number;
    height: number;
    fsize: number;
}

const B_Game: React.FC<Args> = (args) => {
    const [isHovered, setIsHovered] = useState(false);

    const buttonStyle = {
        background: isHovered
            ? 'linear-gradient(0deg, rgba(76,89,112,0.8) 0%, rgba(102,204,102,0.8) 100%)'
            : 'linear-gradient(0deg, rgba(76,89,112,1) 0%, rgba(102,204,102,1) 100%)',
        color: 'white',
        borderRadius: '30px',
        width: args.width,
        height: args.height,
        fontFamily: "'Press Start 2P'",
        fontSize: args.fsize,
        fontStyle: 'normal',
        display: 'swap',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        border: isHovered
            ? '3px solid rgba(255,255,255,0.7)'
            : 'none',
        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.4)'
    }

    const handleMouseEnter = () => {
        setIsHovered(true);
      };
    
      const handleMouseLeave = () => {
        setIsHovered(false);
      };
    
      return (
        <button
          className='B_Game'
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {args.name}
        </button>
      );
}

export default B_Game;