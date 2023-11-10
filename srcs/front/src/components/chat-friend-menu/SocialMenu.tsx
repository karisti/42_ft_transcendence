import React, { useState, useEffect, useContext, useRef } from "react";
import UserProfile from "./ProfileDisplay";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { get2FAuthUserVerificationRemove, getUserProfile } from '../../requests/User.Service';
import FriendDisplay from "./FriendDisplay";
import ChannelDisplay from "./ChannelDisplay"
import { FaAngleRight, FaAngleLeft, FaCrown, FaCheck } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import ChatDisplay from "./ChatDisplay";
import { SocketContext1, SocketContext2 } from '../../SocketContext';
import NotificationContext from '../../NotificationContext';
//BiChevronLeft 


function Menu() {
	const socket = useContext(SocketContext1);

	const initialIsMenuExpanded = localStorage.getItem("isMenuExpanded") === "true";
	const initialSelectedButton = localStorage.getItem("selectedButton") || 'friend';

	const [username, setUsername] = useState('');
	const [userImage, setUserImage] = useState<string>('');
	const [isSiteAdmin, setIsSiteAdmin] = useState(false);
	const [selectedButton, setSelectedButton] = useState(initialSelectedButton);
	const [isMenuExpanded, setIsMenuExpanded] = useState(initialIsMenuExpanded);
	const [isFriendChat, setIsFriendChat] = useState(false);
	const [selectedChat, setSelectedChat] = useState<number>(0);

	const [notifications, setNotifications] = useState<Array<{ id: number; content: string }>>([]);
	const [showNotification, setShowNotification] = useState(false);
	const [showDuelButton, setShowDuelButton] = useState(false);
	const [duelId, setDuelId] = useState(0);
	const [gamemode, setGamemode] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	const previousSelectedButton = useRef(selectedButton);

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const userProfile = await getUserProfile();
				setUsername(userProfile.username);
				setUserImage(userProfile.userImage);
				setIsSiteAdmin(userProfile.siteAdmin);
			} catch (error) {
				await get2FAuthUserVerificationRemove();
				localStorage.removeItem('token');
				navigate('/');
			}
		};

		if (selectedChat)
			setSelectedButton('');
		else if (selectedChat === 0 && selectedButton === '' && previousSelectedButton.current)
			setSelectedButton(previousSelectedButton.current);

		const handleMyInfo = async (data: { isSiteAdmin: boolean, isBanned: boolean }) => {
			if (data.isBanned) {
				localStorage.removeItem('token');
				navigate('/');
			}

			if (data.isSiteAdmin != isSiteAdmin) {
				if (data.isSiteAdmin)
					handleNotification('Te han ascendido a admin de la pagina!');
				else
					handleNotification('Ya no eres admin de la pagina :(');

				setIsSiteAdmin(data.isSiteAdmin);
			}
		}

		const handleDuelCommand = async (data: { userId: number, nick: string, isOriginal: boolean }) => {
			handleNotification(data.nick + ' te ha retado a un duelo de Pong');
			setDuelId(data.userId);
			setGamemode(data.isOriginal);
			setShowDuelButton(true);

			setTimeout(() => {
				setShowDuelButton(false);
			}, 8000);
		}

		socket?.on("UPDATE_ME", handleMyInfo);
		socket?.on("DUEL", handleDuelCommand);

		fetchUserProfile();

		// return () => {
		// socket?.off();
		// socket2?.off();
		// if (socket?.connected)
		// socket.disconnect();
		// if (socket2?.connected)
		// socket2.disconnect();
		// }
	}, [socket, selectedChat, isSiteAdmin]);

	useEffect(() => {
		if (location.pathname === "/administration" && !isSiteAdmin) {
			navigate('/homepage');
		}
	}, [location, navigate, isSiteAdmin]);

	useEffect(() => {

		if (selectedButton !== '')
			setSelectedChat(0);


	}, [selectedButton]);

	useEffect(() => {
		if (notifications.length > 0) {
			setShowNotification(true);
			setTimeout(() => {
				setNotifications((prev) => prev.slice(1));
			}, 4000);
		} else
			setShowNotification(false);

	}, [notifications]);


	const MenuStyle: React.CSSProperties = {
		height: '100vh',
		width: '20vw',
		backgroundColor: '#1C2C4A',
		top: '0%',
		left: '80%',
		position: 'absolute',
		transition: 'width 0.5s ease, left 0.5s ease',
		overflow: 'hidden',
	};

	const ProfileButtonStyle: React.CSSProperties = {
		border: 'none',
		background: 'none',
		height: '12%',
		width: '75%',
		top: '4%',
		left: '12%',
		position: 'absolute',
		cursor: 'pointer',
	};

	const CrownIconStyle: React.CSSProperties = {
		border: 'none',
		background: 'none',
		top: '0.5%',
		left: '20%',
		position: 'absolute',
		cursor: 'pointer',
		borderRadius: '25%',
	};

	const FriendButtonStyle: React.CSSProperties = {
		border: 'none',
		background: 'none',
		fontFamily: 'Quantico',
		fontSize: '1vw',
		height: '5vh',
		width: '50%',
		top: '18%',
		left: '0%',
		position: 'absolute',
		cursor: 'pointer',
		minBlockSize: '25px',
		borderBottom: selectedButton === 'friend' ? '3px solid #D4D4D4' : '3px double black',
		color: selectedButton === 'friend' ? '#FFFFFF' : '#D4D4D4',
		textShadow: selectedButton === 'friend' ? '0.6px 0 0 black' : 'none',
	};

	const ChannelsButtonStyle: React.CSSProperties = {
		border: 'none',
		background: 'none',
		fontFamily: 'Quantico',
		fontSize: '1vw',
		height: '5vh',
		width: '50%',
		top: '18%',
		left: '50%',
		position: 'absolute',
		cursor: 'pointer',
		minBlockSize: '25px',
		borderBottom: selectedButton === 'channels' ? '3px solid #D4D4D4' : '3px double black',
		color: selectedButton === 'channels' ? '#FFFFFF' : '#D4D4D4',
		textShadow: selectedButton === 'channels' ? '0.6px 0 0 black' : 'none',
	};

	const SocialDisplay: React.CSSProperties = {
		width: '0%',
		height: '77%',
		backgroundColor: 'grey',
		top: '23.09%',
		left: '0%',
		position: 'absolute',
	};

	const toggleButtonStyle: React.CSSProperties = isMenuExpanded
		? {
			position: 'absolute',
			top: '50px',
			right: '20vw',
			backgroundColor: 'transparent',
			color: 'white',
			border: 'none',
			padding: '6px',
			transition: 'right 0.5s ease',
		} : {
			position: 'absolute',
			top: '50px',
			right: '0',
			backgroundColor: 'transparent',
			color: 'white',
			border: 'none',
			padding: '6px',
			transition: 'right 0.5s ease',
		};


	const SettingsStyle: React.CSSProperties = {
		position: 'relative',
		top: '1%',
		left: '90%',
	};

	const notificationMessageStyle: React.CSSProperties = {
		position: "fixed",
		top: "15px",
		right: isMenuExpanded ? "calc(20vw + 20px)" : "20px",
		padding: "8px",
		backgroundColor: "#1C2C4A",
		fontSize: '14px',
		color: "#fff",
		zIndex: 2,
		borderRadius: '5px',
		transition: 'right 0.5s ease'
	};

	const duelButtonStyle: React.CSSProperties = {
		backgroundColor: "transparent",
		border: "none",
		color: "#4CAF50",
		fontSize: "15px",
		cursor: 'pointer',
		marginLeft: "10px"
	};

	const handleFriendButtonClick = () => {
		setSelectedButton('friend');
		localStorage.setItem("selectedButton", 'friend');
		previousSelectedButton.current = '';
	};

	const handleChannelsButtonClick = () => {
		setSelectedButton('channels');
		localStorage.setItem("selectedButton", 'channels');
		previousSelectedButton.current = '';
	};

	const openChat = (id: number, isFriend: boolean) => {
		if (id !== 0) {
			previousSelectedButton.current = selectedButton;
			setSelectedChat(id);
		}

		setIsFriendChat(isFriend);
	};

	const handleNotification = (message: string) => {
		setNotifications((prev) => [...prev, { id: Date.now(), content: message }]);
	};

	return (
		<NotificationContext.Provider value={{ handleNotification }}>
			<>
				<button
					style={toggleButtonStyle}
					onClick={() => {
						setIsMenuExpanded(!isMenuExpanded);
						localStorage.setItem("isMenuExpanded", (!isMenuExpanded).toString());
					}}
				>
					{isMenuExpanded ? <FaAngleRight size={22} /> : <FaAngleLeft size={22} />}
				</button>

				{showNotification && (
					<div style={notificationMessageStyle}>
						{notifications[0]?.content}
						{showDuelButton && (
							<button style={duelButtonStyle} onClick={() => {
								{!gamemode ?
								navigate('/pong/' + duelId) :
								navigate('/pong-alter/' + duelId);
							}}}>
								<FaCheck />
							</button>
						)}
					</div>
				)}

				<div style={{
					...MenuStyle,
					width: isMenuExpanded ? '20vw' : '0',
					left: isMenuExpanded ? '80%' : '100%',
				}}>
					<Link to={'/perfil'}>
						<button style={ProfileButtonStyle}>
							<UserProfile image={userImage} name={username}></UserProfile>
						</button>
					</Link>
					{isSiteAdmin &&
						<Link to={'/administration'}>

							<button style={CrownIconStyle}>
								<FaCrown color="gold" size={30} />
							</button>
						</Link>
					}

					<Link to='/settings'>
						<div style={SettingsStyle}>
							<IoMdSettings color="lightgray" size={28}></IoMdSettings>
						</div>
					</Link>
					<div>
						<button style={FriendButtonStyle} onClick={handleFriendButtonClick}>
							Amigos
						</button>
						<button style={ChannelsButtonStyle} onClick={handleChannelsButtonClick}>
							Canales
						</button>
						<div style={SocialDisplay}>
							{selectedChat ? (
								<ChatDisplay selectedChat={selectedChat} setSelectedChat={setSelectedChat} isFriendChat={isFriendChat} />
							) : (
								selectedButton === 'friend' ? <FriendDisplay openChat={(id) => openChat(id, true)} /> : <ChannelDisplay openChat={(id) => openChat(id, false)} />
							)}
						</div>
					</div>
				</div>
			</>
		</NotificationContext.Provider>
	);
}

export default Menu;
