import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdArrowRoundBack, IoMdSend } from 'react-icons/io';
import { FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';
import { getChatDirect, sendDirectMessage, getChatChannel, sendChannelMessage } from '../../requests/Chat.Service';
import { getUserImage } from "../../requests/User.Service";
import { SocketContext1 } from '../../SocketContext';
import NotificationContext from '../../NotificationContext';

interface ChatDisplayProps {
    selectedChat: number;
    setSelectedChat: (chat: number) => void;
    isFriendChat: boolean;
}

interface Message {
    directId?: number,
    channelId?: number,
    userId: number,
    sender: string,
    avatarUri: string,
    sentAt: string,
    message: string,
    isAdmin?: string,
    avatarFile?: string,
};

interface User {
    userId: number,
    nick: string,
    avatarUri: string,
}


const ChatDisplay: React.FC<ChatDisplayProps> = ({ selectedChat, setSelectedChat }) => {
    const socket = useContext(SocketContext1);

    const { handleNotification } = useContext(NotificationContext);

    const [messagesList, setMessagesList] = useState<Message[]>([]);
    const [usersMap, setUsersMap] = useState<User[]>([]);
    const [showCommands, setShowCommands] = useState(false);

    const toggleCommands = () => {
        setShowCommands(!showCommands);
    }

    useEffect(() => {
        const fetchData = async () => {
            if (selectedChat !== 0) {
                const result = await getChatChannel(selectedChat);
                if (result && result.members && result.messages) {
                    const { members, messages } = result;
                    setUsersMap(members);
                    const messagesWithImages = await Promise.all(messages.map(async (msg: Message) => {
                        const imageUrl = await getUserImage(msg.avatarUri);
                        return { ...msg, avatarFile: imageUrl ?? '' };
                    }));
                    setMessagesList(messagesWithImages);
                }
            }
        };

        const handleNewChannelMessages = async (msg: Message) => {
            if (selectedChat === msg.channelId) {
                const imageUrl = await getUserImage(msg.avatarUri);
                msg.avatarFile = imageUrl ? imageUrl : '';
                setMessagesList(oldMessageList => [...oldMessageList, msg]);
            }
        };

        const handleUpdateChannelJoin = async (newUserList: []) => {
            setUsersMap(newUserList);
        }

        // const handleUpdateChannelLeave = async (newUserList: []) => {
        //     setUsersMap(newUserList);
        // }


        const handleKickCommand = async (data: { channelId: number }) => {
            handleNotification('Te han echado/baneado del canal');
            if (selectedChat === data.channelId)
                setSelectedChat(0);
        }

        fetchData();
        socket?.on("NEW_ADMIN_CHANNEL_MESSAGE", handleNewChannelMessages);
        socket?.on("UPDATE_CHANNEL_USERS_LIST_JOIN", handleUpdateChannelJoin);
        socket?.on("UPDATE_CHANNEL_USERS_LIST_LEAVE", handleUpdateChannelJoin);
        socket?.on("KICK_FROM_CHANNEL", handleKickCommand);


        // return () => {
        //     if (isFriendChat) {
        //         socket.off("NEW_DIRECT_MESSAGE", handleNewDirectMessages);
        //     } else {
        //         socket.off("NEW_CHANNEL_MESSAGE", handleNewChannelMessages);
        //         socket.off("UPDATE_CHANNEL_USERS_LIST", handleUpdateChannel);
        //     }
        // };
    }, [selectedChat, socket]);

    const ChatWrapper: React.CSSProperties = {
        height: '80vh',
        width: '20vw',
        top: '0%',
        left: '80%',
        position: 'absolute',
    };

    const BackArrowStyle: React.CSSProperties = {
        top: '1%',
        position: 'relative',
        cursor: 'pointer',
        background: 'transparent',
        border: 'none'
    }

    // ----------- STYLOS DE MENSAJE ------------

    const MessagesContainerStyle: React.CSSProperties = {
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column-reverse',
        height: '60vh',
        overflowY: 'auto',
        padding: '10px'
    };

    const MessageStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: '5%',
        width: '90%',
        position: 'relative',
        marginTop: '10px',
    };

    const UserImageStyle: React.CSSProperties = {
        marginLeft: '5px',
        marginTop: '5px',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        marginRight: '10px',
        objectFit: 'cover',
        display: 'flex',
        alignItems: 'center'
    };

    const MessageContentStyle: React.CSSProperties = {
        whiteSpace: 'pre-wrap',
        color: '#A9A9A9',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'Quantico',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
    };

    const UserNameStyle: React.CSSProperties = {
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        marginRight: '10px',
        marginTop: '16px',
    };


    return (
        <div style={ChatWrapper}>
            <button style={BackArrowStyle} onClick={() => setSelectedChat(0)}>
                <IoMdArrowRoundBack size={27} color='grey' />
            </button>

            <div style={MessagesContainerStyle}>
                {[...messagesList].reverse().map((messageItem, index) => {
                    return (
                        <div key={index} style={MessageStyle}>
                            <Link style={{ textDecoration: 'none' }} to={`/perfil/${messageItem.sender}`}>
                                <img
                                    src={messageItem.avatarFile}
                                    alt={messageItem.sender}
                                    style={UserImageStyle}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                            </Link>
                            <div style={{ ...UserNameStyle, color: messageItem.isAdmin ? 'red' : UserNameStyle.color }}>
                                <Link style={{ textDecoration: 'none' }} to={`/perfil/${messageItem.sender}`} onClick={(e) => {
                                    e.stopPropagation();
                                }}>
                                    <span style={UserNameStyle}>
                                        {messageItem.sender}
                                    </span>
                                </Link>
                                <p style={MessageContentStyle}>
                                    {messageItem.message}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );

}
export default ChatDisplay;
