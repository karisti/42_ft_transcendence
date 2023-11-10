import React, { useContext, useEffect, useState, useRef } from 'react';
import { addFriend, deleteFriend, getBlockedUsers, getFriendList, getFriendRequests, unblockUser, updateFriendList } from '../../requests/Friend.Service';
import { getUserImage } from "../../requests/User.Service";
import { FaCaretDown, FaCaretUp, FaCheck, FaTimes } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';
import { SocketContext1, SocketContext2 } from '../../SocketContext';
import NotificationContext from '../../NotificationContext';

interface Friend {
    userId: number;
    nick: string;
    avatarUri: string;
    isOnline: boolean;
    isInGame: boolean;
    avatarFile?: string | null;
}

function FriendDisplay({ openChat }: { openChat: (friendName: number) => void }) {
    const socket = useContext(SocketContext1);
    const socketUserStatus = useContext(SocketContext2);

    const { handleNotification } = useContext(NotificationContext);

    const initialFriendsExpanded = localStorage.getItem("showFriends") === "true";
    const initialPetitionsExpanded = localStorage.getItem("showRequests") === "true";
    const initialBlocksExpanded = localStorage.getItem("showBlocked") === "true";

    const [isHovered, setIsHovered] = useState(false);
    const [friendName, setFriendName] = useState('');

    const [friendList, setFriendList] = useState<Friend[]>([]);
    const [showFriends, setShowFriends] = useState(initialFriendsExpanded);
    const [isFriendHovered, setIsFriendHovered] = useState(-1);
    const [friendPetitionList, setFriendPetitionList] = useState<Friend[]>([]);
    const [showRequests, setShowRequests] = useState(initialPetitionsExpanded);
    const [isRequestHovered, setIsRequestHovered] = useState(-1);
    const [isAcceptHovered, setIsAcceptHovered] = useState(false);
    const [isRejectHovered, setIsRejectHovered] = useState(false);

    const [blockedUsersList, setBlockedUsersList] = useState<Friend[]>([]);
    const [showBlocked, setShowBlocked] = useState(initialBlocksExpanded);
    const [isBlockedHovered, setIsBlockedHovered] = useState(-1);


    useEffect(() => {

            // FriendList Functions
            const fetchFriends = async () => {
                const friendsRequest = await getFriendList();
                const friendsWithImages = await Promise.all(friendsRequest.friends.map(async (friend: { avatarUri: string; }) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setFriendList(friendsWithImages);
                // console.log(friendList);
            };

            const handleFriendListNew = async (data: { friends: [], friend_requests: [] }) => {
                const newFriendsList = data.friends;
                const newRequestList = data.friend_requests;

                // console.log(newFriendsList);
                const friendsWithImages = await Promise.all(newFriendsList.map(async (friend: Friend) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setFriendList(friendsWithImages);

                // console.log(newRequestList);
                const friendsWithImages2 = await Promise.all(newRequestList.map(async (friend: Friend) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setFriendPetitionList(friendsWithImages2);
            };

            const handleFriendListStatus = async (newFriend: Friend) => {
                // obtener la imagen del usuario primero
                const avatarFile = await getUserImage(newFriend.avatarUri);
                
                // luego actualizar el estado
                setFriendList((oldFriendList) => {
                  const i = oldFriendList.findIndex(friend => friend.userId === newFriend.userId);
                
                  if (i === -1) return oldFriendList;
                
                  const updatedFriendList = [...oldFriendList]; // Crear una copia del antiguo friendList
                  updatedFriendList[i] = {...newFriend, avatarFile}; // actualizar la información del amigo en la nueva lista
              
                  return updatedFriendList; // devolver la nueva lista
                });
              };

            // FriendPetition Functions
            const fetchFriendPetition = async () => {
                const friendsRequest = await getFriendRequests();
                const friendsWithImages = await Promise.all(friendsRequest.friends.map(async (friend: { avatarUri: string; }) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setFriendPetitionList(friendsWithImages);
            };

            const handleFriendRequestNew = async (newFriendsRequest: Friend[]) => {
                const friendsWithImages = await Promise.all(newFriendsRequest.map(async (friend: Friend) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setFriendPetitionList(friendsWithImages);
            };

            const handleFriendRequestReject = async (newFriendsRequest: Friend[]) => {
                const friendsWithImages = await Promise.all(newFriendsRequest.map(async (friend: Friend) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setFriendPetitionList(friendsWithImages);
            };

            // BlockList Functions
            const fetchBlockedUsers = async () => {
                const blockedUsersRequest = await getBlockedUsers();
                const blockedUsersWithImages = await Promise.all(blockedUsersRequest.map(async (blockedUser: { avatarUri: string; nick: string; userId: number }) => {
                    const imageUrl = await getUserImage(blockedUser.avatarUri);
                    return {
                        userId: blockedUser.userId,
                        nick: blockedUser.nick,
                        avatarFile: imageUrl,
                        isOnline: false,
                        isInGame: false,
                    };
                }));
                setBlockedUsersList(blockedUsersWithImages);
            };

            const handleFriendListUpdate = async (newFriendList: []) => {
                const friendsWithImages = await Promise.all(newFriendList.map(async (friend: Friend) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setFriendList(friendsWithImages);
            };

            const handleBlockedListUpdate = async (newBlockedList: []) => {
                const friendsWithImages = await Promise.all(newBlockedList.map(async (friend: Friend) => {
                    const imageUrl = await getUserImage(friend.avatarUri);
                    return { ...friend, avatarFile: imageUrl };
                }));
                setBlockedUsersList(friendsWithImages);
            };


            fetchFriends();
            socket?.on("FRIEND_REQUEST_ACCEPTED", handleFriendListNew);
            socketUserStatus?.on("UPDATE_USER", handleFriendListStatus);
            
            fetchFriendPetition();
            socket?.on("FRIEND_REQUEST_NEW", handleFriendRequestNew);
            socket?.on("FRIEND_REQUEST_REJECTED", handleFriendRequestReject);
            
            fetchBlockedUsers();
            socket?.on("UPDATE_FRIEND_LIST", handleFriendListUpdate);
            socket?.on("UPDATE_BLOCKED_LIST", handleBlockedListUpdate);

            // return () => {
            //     socket?.off();
            //     if (socket?.connected)
            //         socket.disconnect();
            // };
    }, [socket, socketUserStatus]);

    useEffect(() => {
        localStorage.setItem("showFriends", String(showFriends));
    }, [showFriends]);

    useEffect(() => {
        localStorage.setItem("showRequests", String(showRequests));
    }, [showRequests]);

    useEffect(() => {
        localStorage.setItem("showBlocked", String(showBlocked));
    }, [showBlocked]);

    // ------------------ STYLES ----------------------------

    const FriendWrapper: React.CSSProperties = {
        height: '100vh',
        width: '20vw',
        top: '0%',
        left: '80%',
        position: 'absolute',
    };

    const addFriendButtonWrapper: React.CSSProperties = {
        top: '2%',
        left: '20%',
        width: '60%',
        height: '40px',
        display: "flex",
        position: "relative",
    };

    const addFriendButtonStyle: React.CSSProperties = {
        width: "100%",
        background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 110%)',
        borderRadius: '12px',
        border: 'none',
        fontFamily: "'Press Start 2P'",
        fontSize: "11px",
        position: "relative",
        textAlign: "center",
    }

    const addFriendInputWrapperStyle: React.CSSProperties = {
        width: '100%',
        background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 110%)',
        borderRadius: '12px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const addFriendInputTextStyle: React.CSSProperties = {
        border: 'none',
        fontFamily: "'Press Start 2P'",
        left: '8px',
        position: 'relative',
        fontSize: "12px",
        height: '22px',
        width: "150px",
        background: 'transparent',
        textAlign: 'center',
        borderBottom: '2px solid black',
    }

    const addFriendInputTextSendStyle: React.CSSProperties = {
        marginLeft: '12px',
        cursor: 'pointer'
    }

    // Dropdown Users/Petitions 
    const dropDownContainerStyle: React.CSSProperties = {
        position: 'relative',
        top: '30px',
        width: '100%',
        paddingBottom: '6px',
        overflow: 'hidden',
        maxHeight: showFriends ? '500px' : '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        marginTop: '10px',
        transition: 'max-height 0.8s ease-in-out',
    }

    const dropDownStyle: React.CSSProperties = {
        color: 'white',
        left: '12%',
        width: '28%',
        background: 'transparent',
        border: 'none',
        scale: '1.4',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        justifyContent: 'flex-start'
    }

    // Friends Display
    const friendsListStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: '2.5%',
        marginLeft: '9%',
        width: '66%',
        // overflowY: 'scroll',
    };

    const friendContainerStyle: React.CSSProperties = {
        width: '35%',
        marginBottom: '3%',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.3s ease-in-out, background-color 0.3s ease',
        maxHeight: '52px',
    };

    const avatarWrapperStyle: React.CSSProperties = {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'blue',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        top: '5%',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out, background-color 0.8s ease',
    };

    const avatarStyle: React.CSSProperties = {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    };
    const nameStyle: React.CSSProperties = {
        width: '85px',
        height: '38px',
        left: '45px',
        bottom: '56px',
        position: 'relative',
        justifyContent: 'flex-start',
        fontSize: '14px',
        color: '#c0c0c0',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '10px'
    }

    const buttonContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: '72.2%',
        width: '100%'
    };

    const iconContainerStyle: React.CSSProperties = {
        position: 'absolute',
        left: '100px',
        top: '0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '25px',
        height: '50%',
        opacity: 0.5,
        transition: 'opacity 1.5s ease-in-out',
    };

    const iconStyle: React.CSSProperties = {
        margin: '5px',
    };

    const getIconStyle = (isHovered: boolean, color: string): React.CSSProperties => ({
        ...iconStyle,
        color: isHovered ? color : 'pink',
        opacity: isHovered ? 1 : 0.70,
        transition: 'color 0.2s ease-in-out, opacity 0.2s ease-in-out',
    });

    const handleClick = () => {
        const newState = !showFriends;
        setShowFriends(newState);
        localStorage.setItem("showFriends", JSON.stringify(newState));
    };

    const handleRequestsClick = () => {
        const newState = !showRequests;
        setShowRequests(newState);
        localStorage.setItem("showRequests", JSON.stringify(newState));
    };

    const handleBlockedClick = () => {
        const newState = !showBlocked;
        setShowBlocked(newState);
        localStorage.setItem("showBlocked", JSON.stringify(newState));
    };

    const handleFriendSumbit = async () => {

        const resp = await addFriend(friendName);
        if (resp)
            handleNotification('Se ha enviado la peticion a ' + friendName);
        else
            handleNotification('No se ha podido enviar la peticion a ' + friendName);
        setFriendName('');
    }

    const handleUnblockUser = async (blockedUser: Friend) => {
        const resp = await unblockUser(blockedUser.nick);
        if (resp)
            handleNotification('Se ha desbloqueado a ' + blockedUser.nick);
        else
            handleNotification('No se ha podido desbloquear a ' + blockedUser.nick);
    }

    return (
        <div style={FriendWrapper}>
            <div
                style={addFriendButtonWrapper}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {!isHovered && (
                    <button style={addFriendButtonStyle}>
                        Añadir amigo
                    </button>
                )}
                {isHovered && (
                    <div style={addFriendInputWrapperStyle}>
                        <input style={addFriendInputTextStyle}
                            type="text"
                            value={friendName}
                            onChange={(e) => setFriendName(e.target.value)}
                            maxLength={10}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleFriendSumbit();
                                }
                            }}
                        />
                        <button
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                            onClick={handleFriendSumbit}
                        >
                            <MdSend style={addFriendInputTextSendStyle} size={20} />
                        </button>
                    </div>
                )}

            </div>
            {/* AMIGOS */}
            <div style={buttonContainerStyle}>
                <div style={dropDownContainerStyle}>
                    <button onClick={handleClick} style={dropDownStyle}>
                        Amigos
                        {showFriends ? <FaCaretUp /> : <FaCaretDown />}
                    </button>

                    <div style={friendsListStyle}>
                        {friendList.map((friend, index) => (
                            <button
                                key={index}
                                style={friendContainerStyle}
                                onMouseEnter={() => setIsFriendHovered(index)}
                                onMouseLeave={() => setIsFriendHovered(-1)}
                                onClick={() => openChat(friend.userId)}
                            >
                                <div style={{
                                    transform: isFriendHovered === index ? 'scale(1.1)' : 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                }}>
                                    <div style={{
                                        ...avatarWrapperStyle,
                                        backgroundColor: friend.isInGame ?
                                            (isFriendHovered === index ? 'orange' : 'darkorange') :
                                            friend.isOnline ?
                                                (isFriendHovered === index ? 'lightgreen' : 'green') :
                                                (isFriendHovered === index ? 'lightred' : 'red')
                                    }}>
                                        <img
                                            className='FriendAvatar'
                                            alt={'Avatar de' + friend.nick}
                                            src={friend.avatarFile || ''}
                                            style={avatarStyle}
                                        />

                                    </div>
                                    <p style={nameStyle}>{friend.nick}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* PETICIONES */}
                <div style={{ ...dropDownContainerStyle, maxHeight: showRequests ? '500px' : '15px' }}>
                    <button onClick={handleRequestsClick} style={dropDownStyle}>
                        Peticiones
                        {showRequests ? <FaCaretUp /> : <FaCaretDown />}
                    </button>

                    <div style={friendsListStyle}>
                        {friendPetitionList.map((request, index) => (
                            <button
                                key={index}
                                style={friendContainerStyle}
                                onMouseEnter={() => setIsRequestHovered(index)}
                                onMouseLeave={() => setIsRequestHovered(-1)}
                            >
                                <div style={{
                                    transform: isRequestHovered === index ? 'scale(1.1)' : 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                }}>
                                    <div style={{
                                        ...avatarWrapperStyle,
                                        backgroundColor: isRequestHovered === index ? 'cyan' : 'darkcyan'
                                    }}>
                                        <img
                                            className='FriendAvatar'
                                            alt={'Avatar de' + request.nick}
                                            src={request.avatarFile || ''}
                                            style={avatarStyle}
                                        />
                                    </div>
                                    <p style={nameStyle}>{request.nick}</p>
                                    {isRequestHovered === index && (
                                        <div style={iconContainerStyle}>
                                            <FaCheck
                                                onMouseEnter={() => setIsAcceptHovered(true)}
                                                onMouseLeave={() => setIsAcceptHovered(false)}
                                                style={getIconStyle(isAcceptHovered, 'green')}
                                                size={15}
                                                onClick={async () => await updateFriendList(request.nick)}
                                            />

                                            <FaTimes
                                                onMouseEnter={() => setIsRejectHovered(true)}
                                                onMouseLeave={() => setIsRejectHovered(false)}
                                                style={getIconStyle(isRejectHovered, 'red')}
                                                size={16}
                                                onClick={async () => await deleteFriend(request.nick)} // No se borra??
                                            />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                {/* BLOQUEADOS */}
                <div style={{ ...dropDownContainerStyle, maxHeight: showBlocked ? '500px' : '15px' }}>
                    <button onClick={handleBlockedClick} style={dropDownStyle}>
                        Bloqueados
                        {showBlocked ? <FaCaretUp /> : <FaCaretDown />}
                    </button>

                    <div style={friendsListStyle}>
                        {blockedUsersList.map((blockedUser, index) => (
                            <button
                                key={index}
                                style={friendContainerStyle}
                                onMouseEnter={() => setIsBlockedHovered(index)}
                                onMouseLeave={() => setIsBlockedHovered(-1)}
                                onClick={(event) => handleUnblockUser(blockedUser)}
                            >
                                <div style={{
                                    transform: isBlockedHovered === index ? 'scale(1.1)' : 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                }}>
                                    <div style={{
                                        ...avatarWrapperStyle,
                                        backgroundColor: isBlockedHovered === index ? 'lightgray' : 'gray'
                                    }}>
                                        <img
                                            className='FriendAvatar'
                                            alt={'Avatar de' + blockedUser.nick}
                                            src={blockedUser.avatarFile || ''}
                                            style={avatarStyle}
                                        />
                                    </div>
                                    <p style={nameStyle}>{blockedUser.nick}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div >
        </div>
    );
}

export default FriendDisplay;
