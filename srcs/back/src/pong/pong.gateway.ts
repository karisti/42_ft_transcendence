import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from "@nestjs/config";
import { UserService } from "../user/user.service";
import { WebSocketService } from '../auth/websocket/websocket.service';
import { Pong } from './pong.original';
import { InputState } from './types';
import { PlayerID } from './player';
import { PongGameMatchService } from './pong-game-match/pong-game-match.service';
import { PongGameMatchPlayerDto } from './pong-game-match/dto';
import { IPongBackend } from './interfaces';
import { PongAlt } from './pong.alt';



@WebSocketGateway(8082, {
	cors: {
		// origin: ['http://localhost:3001']
		origin: '*'
	},
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	private games: Map<string, IPongBackend> = new Map();

	
	private waitingClientsOrig: Array<PongGameMatchPlayerDto> = new Array();
	private waitingClientsAlt: Array<PongGameMatchPlayerDto> = new Array();

	private waitingPrivateClientsOrig: Map<number, PongGameMatchPlayerDto> = new Map();
	private waitingPrivateClientsAlt: Map<number, PongGameMatchPlayerDto> = new Map();

	constructor(private config: ConfigService, private userService: UserService,
				private webSocketService: WebSocketService, private pongGameMatchService: PongGameMatchService) { }

	afterInit(server: any) { }

	async matchPlayersAny(isOriginalPong: boolean)
	{

		// Spawn new games until queued clients come down to 1
		while (this.getSelectedWaitingClients(isOriginalPong).length > 1)
		{
			const player1 = this.popSelectedWaitingClients(isOriginalPong); // First client in the queue is player 1
			const player2 = this.popSelectedWaitingClients(isOriginalPong); // Second client in the queue is player 2
			const roomId = `${player1.userId}_${player2.userId}`; // create a Socket.IO websocket room name with both client ids
			
			let pongBackend: IPongBackend;
			if (isOriginalPong)
				pongBackend = new Pong(player1.nick, player2.nick); // Start a game for them both
			else
				pongBackend = new PongAlt(player1.nick, player2.nick); // Start a game for them both

			this.games.set(roomId, pongBackend); // Add to the running games map
			// Add both clients to the same room
			player1.socket.join(roomId);
			player2.socket.join(roomId);

			// Add new match to matches DB table
			try {
				const gameMatch = await this.pongGameMatchService.createNewMatch({userId1: player1.userId, userId2: player2.userId, isOriginalPong: isOriginalPong});

				if (gameMatch == null) {
					this.pushSelectedWaitingClients(player1, isOriginalPong);
					this.pushSelectedWaitingClients(player2, isOriginalPong);
				} else {
					// Start the game loop; have fun! :)
					this.startGameLoop(player1, player2, roomId, gameMatch.id);
				}

			} catch (error) {
				this.pushSelectedWaitingClients(player1, isOriginalPong);
				this.pushSelectedWaitingClients(player2, isOriginalPong);
			}
		}
	}

	startGameLoop(player1: PongGameMatchPlayerDto, player2: PongGameMatchPlayerDto, roomId: string, matchId: number)
	{
		console.log("game started!")
		const pongBackend = this.games.get(roomId);
		let isCleanedUp = false;
		let gameLoop: NodeJS.Timer;
		// Inform each player which paddle is theirs
		player1.socket.emit('player-id', PlayerID.LEFT_PLAYER);
		player2.socket.emit('player-id', PlayerID.RIGHT_PLAYER);
		this.server.to(roomId).emit('player_nicks', {leftPlayerNick: player1.nick, rightPlayerNick: player2.nick});
		
		// Set callback to apply Player1 inputs
		player1.socket.on('input', (input: InputState) => {
			pongBackend.applyRemoteP1Input(input);
			console.log("Input");
		});

		// Set callback to apply Player2 inputs
		player2.socket.on('input', (input: InputState) => {
			pongBackend.applyRemoteP2Input(input);
			console.log("Input");
		});

		//Cleanup logic - this should be own function or something
		const cleanUp = () => {
			if (isCleanedUp) return;
			isCleanedUp = true;
			// clean up event listeners and game loop
			player1.socket.removeAllListeners();
			player2.socket.removeAllListeners();

			try {
				this.userService.setUserInGame(player1.userId, false);
				this.userService.setUserInGame(player2.userId, false);
			} catch (error) {
			}

			player1.socket.disconnect();
			player2.socket.disconnect();
			
			if (gameLoop)
				clearInterval(gameLoop);
			this.games.delete(roomId);
			console.log("Disconnected, nice and clean-like");
		};

		// Broadcast game state at regular intervals
		gameLoop = setInterval(() => {
			//Set the game state for the next frame
			pongBackend.setGameState();
			//Get the game state
			let gameState = pongBackend.getGameState();
			//Emit game state to all clients in room
			this.server.to(roomId).emit('gameState', gameState);
			//Check if game over
			if (gameState.gameOver)
			{
				let winner;
				if (gameState.winner == PlayerID.LEFT_PLAYER) {
					winner = player1.userId;
					this.userService.updateGameStats(player1.userId, true);
					this.userService.updateGameStats(player2.userId, false);
				} else {
					winner = player2.userId;
					this.userService.updateGameStats(player1.userId, false);
					this.userService.updateGameStats(player2.userId, true);
				}

				// Update match info
				this.pongGameMatchService.updateMatchInfo({
					matchId: matchId,
					hasEnded: true,
					score1: gameState.leftPlayerScore,
					score2: gameState.rightPlayerScore,
					winnerUserId: winner
				});

				cleanUp();
			}
				
		}, 1000 / 60); // 60 times a second
	}

	async handleConnection(client: any, ...args: any[]) {
		console.log("handleConnection");
	}
	
	async handleDisconnect(client: any) {
		const userId = this.webSocketService.getUserIdFromHeaders(client.handshake.headers);

		if (userId == null)
		{
			console.log('Alguien se ha ido del juego ❌');
			client.disconnect();
			return;
		}

		this.waitingClientsOrig = this.waitingClientsOrig.filter((player: {userId: number, socket: Socket}) => player.userId !== userId);
		this.waitingClientsAlt = this.waitingClientsAlt.filter((player: {userId: number, socket: Socket}) => player.userId !== userId);

		if (this.waitingPrivateClientsOrig.has(userId))
			this.waitingPrivateClientsOrig.delete(userId);

		if (this.waitingPrivateClientsAlt.has(userId))
			this.waitingPrivateClientsAlt.delete(userId);
		
		try {
			const user = await this.userService.setUserInGame(userId, false);

			if (user == null)
			{
				client.disconnect();
				return;
			}

			console.log(user.nick + ' ha salido del juego ❌');

		} catch (error) {
			client.disconnect();
		}
		
	}


	@SubscribeMessage('game_connection')
	async handleGameConnections(client: Socket, data: { gameUserId: string, spectateUserId: string, isOriginalPong: boolean }) {

		const userId = this.webSocketService.getUserIdFromHeaders(client.handshake.headers);

		if (userId == null)
		{
			client.disconnect();
			return;
		}

		try {
			const user = await this.userService.getUserById(userId);
			
			if (user == null)
			{
				client.disconnect();
				return;
			}
			
			if (data.spectateUserId.length > 0) {
				this.spectateUser(client, userId, data.spectateUserId, data.isOriginalPong);
				
			} else if (data.gameUserId.length > 0) {
				/* Evitamos que si ya esta jugando, entre a otra partida */
				if (this.getUserPlaying(userId).roomId == '')
					this.privateGame(client, user, Number(data.gameUserId), data.isOriginalPong);

			} else {
				/* Evitamos que si ya esta jugando, entre a otra partida */
				if (this.getUserPlaying(userId).roomId == '')
					this.publicGame(client, user, data.isOriginalPong);
			}

		} catch (error) {
		}
	}

	spectateUser(client: Socket, userId: number, spectateUserId: string, isOriginalPong: boolean) {
		console.log("Espectador nuevo! Para spectear a " + spectateUserId);

		const playingUser = this.getUserPlaying(Number(spectateUserId));

		if (playingUser.roomId == '' || playingUser.pongBackend == null ||
			isOriginalPong != playingUser.pongBackend.getIsOriginalPong()) {
			client.emit('spectate_match_not_found', true);
			return ;
		}
		
		client.join(playingUser.roomId);

		client.emit('player_nicks', {
				leftPlayerNick: playingUser.pongBackend.getLeftPlayerNick(),
				rightPlayerNick: playingUser.pongBackend.getRightPlayerNick()
		});

	}

	async privateGame(client: Socket, user: any, gameUserId: number, isOriginalPong: boolean) {
		console.log("Jugador nuevo! Para jugar con " + gameUserId);

		const userPlayer: PongGameMatchPlayerDto = {userId: user.id, nick: user.nick, socket: client};
		const otherPlayer: PongGameMatchPlayerDto = this.getSelectedWaitingPrivateClients(gameUserId, isOriginalPong);

		if (!otherPlayer || otherPlayer.userId == userPlayer.userId) {
			this.setSelectedWaitingPrivateClients(user.id, userPlayer, isOriginalPong);
		} else {
			this.deleteSelectedWaitingPrivateClients(otherPlayer.userId, isOriginalPong);
			await this.createPrivateMatch(userPlayer, otherPlayer, isOriginalPong);
		}
	}

	async publicGame(client: Socket, user: any, isOriginalPong: boolean) {
		console.log("Jugador nuevo! Para jugar con cualquier desconocido!");

		try {
			const userPlayer: PongGameMatchPlayerDto = {userId: user.id, nick: user.nick, socket: client};

			await this.userService.setUserInGame(user.id, true);

			console.log('Hola! ' + user.nick + ' está jugando ✅');
			const waitingClients = this.getSelectedWaitingClients(isOriginalPong).filter((player: {userId: number, socket: Socket}) => player.userId !== user.id);
			this.setSelectedWaitingClients(waitingClients, isOriginalPong);
			this.pushSelectedWaitingClients(userPlayer, isOriginalPong);
			
			await this.matchPlayersAny(isOriginalPong);

		} catch (error) {
		}
	}

	async createPrivateMatch(player1: PongGameMatchPlayerDto, player2: PongGameMatchPlayerDto, isOriginalPong: boolean) {
		const roomId = `${player1.userId}_${player2.userId}`; // create a Socket.IO websocket room name with both client ids

		let pongBackend;
		if (isOriginalPong)
			pongBackend = new Pong(player1.nick, player2.nick); // Start a game for them both
		else
			pongBackend = new PongAlt(player1.nick, player2.nick); // Start a game for them both

		this.games.set(roomId, pongBackend); // Add to the running games map
		// Add both clients to the same room
		player1.socket.join(roomId);
		player2.socket.join(roomId);

		// Add new match to matches DB table
		try {
			const gameMatch = await this.pongGameMatchService.createNewMatch({userId1: player1.userId, userId2: player2.userId, isOriginalPong: isOriginalPong});

			if (gameMatch == null) {
				this.setSelectedWaitingPrivateClients(player2.userId, player2, isOriginalPong);
			} else {
				// Start the game loop; have fun! :)
				this.startGameLoop(player1, player2, roomId, gameMatch.id);
			}

		} catch (error) {
			this.setSelectedWaitingPrivateClients(player2.userId, player2, isOriginalPong);
		}
	}

	getUserPlaying(userId: number): {roomId: string, pongBackend: IPongBackend} {

		for (const [roomId, pongBackend ] of this.games.entries()) {

			const userIdsArray = roomId.split("_");

			if (userIdsArray.includes(String(userId)))
				return {roomId: roomId, pongBackend: pongBackend};
		}

		return {roomId: '', pongBackend: null};
	}

	getSelectedWaitingClients(isOriginalPong: boolean): Array<PongGameMatchPlayerDto> {
		if (isOriginalPong)
			return this.waitingClientsOrig;
		else
			return this.waitingClientsAlt;
	}

	setSelectedWaitingClients(waitingClients: Array<PongGameMatchPlayerDto>, isOriginalPong: boolean) {
		if (isOriginalPong)
			this.waitingClientsOrig = waitingClients;
		else
			this.waitingClientsAlt = waitingClients;
	}

	pushSelectedWaitingClients(player: PongGameMatchPlayerDto, isOriginalPong: boolean) {
		if (isOriginalPong)
			return this.waitingClientsOrig.push(player);
		else
			return this.waitingClientsAlt.push(player);
	}

	popSelectedWaitingClients(isOriginalPong: boolean): PongGameMatchPlayerDto {
		if (isOriginalPong)
			return this.waitingClientsOrig.pop();
		else
			return this.waitingClientsAlt.pop();
	}

	getSelectedWaitingPrivateClients(gameUserId: number, isOriginalPong: boolean): PongGameMatchPlayerDto {
		if (isOriginalPong)
			return this.waitingPrivateClientsOrig.get(gameUserId);
		else
			return this.waitingPrivateClientsAlt.get(gameUserId);
	}

	setSelectedWaitingPrivateClients(userId: number, userPlayer: PongGameMatchPlayerDto, isOriginalPong: boolean) {
		if (isOriginalPong)
			return this.waitingPrivateClientsOrig.set(userId, userPlayer);
		else
			return this.waitingPrivateClientsAlt.set(userId, userPlayer);
	}

	deleteSelectedWaitingPrivateClients(userId: number, isOriginalPong: boolean) {
		if (isOriginalPong)
			return this.waitingPrivateClientsOrig.delete(userId);
		else
			return this.waitingPrivateClientsAlt.delete(userId);
	}

}
