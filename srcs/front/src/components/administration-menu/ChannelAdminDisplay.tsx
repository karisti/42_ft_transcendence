import React, { useState, useEffect, useContext } from 'react';
import { getChannelList } from '../../requests/Channel.Service';
import { SocketContext1 } from '../../SocketContext';
import NotificationContext from '../../NotificationContext';

interface Channel {
  id: number
  name: string
  isPrivate: boolean
  imInside: boolean
}

function ChannelDisplay({ openChat }: { openChat: (id: number) => void }) {
  const socket = useContext(SocketContext1);

  const { handleNotification } = useContext(NotificationContext);

  const [channelList, setChannelList] = useState<Channel[]>([]);

  const [isChannelHovered, setIsChannelHovered] = useState(-1);

  useEffect(() => {

      const fetchChannels = async () => {
        const channels = await getChannelList();
        setChannelList(channels);
      };

      const handleChannelsList = async (newChannelList: []) => {
        setChannelList(newChannelList);
      };

      fetchChannels();
      socket?.on("UPDATE_CHANNELS_LIST", handleChannelsList);
  }, [socket]);


  // ------------------- BUTTON CHANNELS STYLES ------------------------------

  const ChannelWrapper: React.CSSProperties = {
    height: '100vh',
    width: '20vw',
    top: '0%',
    left: '80%',
    position: 'absolute',
  }

  // ------------------- CHANNELS LIST STYLES ------------------------------

  const friendsListStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'start',
    width: '100%',
    height: '64.5%',
    marginTop: '7.5%',
    textAlign: 'center',
    overflowY: 'auto',
    background: 'transparent'
  };

  const friendContainerStyle: React.CSSProperties = {
    left: '12.5%',
    top: '10px',
    width: '38%',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    position: 'relative',
    cursor: 'pointer',
    // transition: 'transform 0.3s ease-in-out, background-color 0.3s ease',
    maxHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    scale: '0.9',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontFamily: 'Quantico',
    color: '#c0c0c0',
  }

  const handleJoinByList = async (ch: Channel) => {
    socket?.emit('event_join', ch.name);
    openChat(ch.id);
  }

  return (
    <div style={ChannelWrapper}>
      {/* Channel List */}
      <div style={friendsListStyle}>
        {channelList && channelList.map((channel, index) => (
          <button
            key={index}
            style={friendContainerStyle}
            onMouseEnter={() => setIsChannelHovered(index)}
            onMouseLeave={() => setIsChannelHovered(-1)}
            onClick={() => handleJoinByList(channel)}
          >
            <div style={{
              transform: isChannelHovered === index ? 'scale(1.1)' : 'none',
              transition: 'transform 0.3s ease-in-out',
            }}>

              <p style={{
                ...nameStyle,
                fontWeight: isChannelHovered === index ? 'bold' : 'normal'
              }}>
                {channel.isPrivate ? '🔒' : '🌐'}
                {channel.name}
              </p>
            </div>

          </button>
        ))}
      </div>
    </div>
  );
}

export default ChannelDisplay;


