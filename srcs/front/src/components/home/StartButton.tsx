import React, { useState } from 'react';

interface Args{
  name: string;
}

const RoundStartButton: React.FC<Args> = (args) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    background: isHovered
      ? 'linear-gradient(45deg, rgba(122,151,204,1) 0%, rgba(102,204,102,1) 100%)'
      : 'linear-gradient(45deg, rgba(122,151,204,1) 0%, rgba(102,204,102,1) 100%)',
    color: isHovered 
      ? 'white'
      : 'black',
    borderRadius: '100px',
    width: '255px',
    height: '110px',
    fontFamily: "'Press Start 2P'",
    fontSize: '32px',
    fontStyle: 'normal',
    display: 'swap',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: isHovered
      ? '2px solid white'
      : 'none',
    textShadow: '2px 2px 0px rgba(0, 0, 0, 0.4)'
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className='RoundStartButton'
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {args.name}
    </button>
  );
}

export default RoundStartButton;
