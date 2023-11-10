import React from 'react';

interface Args {
  image: string;
  name: string;
}

const UserProfile: React.FC<Args> = (args) => {

  const avatarStyle: React.CSSProperties = {
    width: '100px',
    height: '100px',
    right: '33%',
    top: '0%',
    position: 'relative',
    borderRadius: '50%',
    objectFit: 'cover',
  };

  const textWrapper: React.CSSProperties = {
    top: '5%',
    left: '44%',
    position: 'absolute',
    fontFamily: 'Quantico',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.5vw',
    maxWidth: '90%',
    whiteSpace: 'nowrap',
  }

  return (
    <div >
        <img
          className="avatar"
          src={args.image}
          alt="avatar"
          style={avatarStyle}
        />
        <div style={textWrapper}>
          <p style={textWrapper}>{args.name}</p>
        </div>
    </div>
  );
}

export default UserProfile;
