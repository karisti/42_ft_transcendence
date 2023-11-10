import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../user/user.service";
import { WebSocketService } from '../../auth/websocket/websocket.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SelfUserStateChangedEvent } from '../../user/user.events';


@WebSocketGateway(8083, {
	cors: {
		// origin: ['http://localhost']
		origin: '*'
	},
})
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	private connectedUsers: Map<number, Socket[]> = new Map();
	
	constructor(private config: ConfigService, private userService: UserService,
		private webSocketService: WebSocketService) { }

	afterInit(server: any) { }
	
	async handleConnection(client: Socket, ...args: any[]) {
		const userId = this.webSocketService.getUserIdFromHeaders(client.handshake.headers);
		
		if (userId == null)
		{
			client.disconnect();
			return;
		}

		try {
			const user = await this.userService.getUserAndChatsById(userId);

			if (this.connectedUsers.has(user.id))
			{
				let sockets: Socket[] = this.connectedUsers.get(user.id);
				sockets = [...sockets, client];
				this.connectedUsers.set(user.id, sockets);

				console.log('Hola! ' + user.nick + ' está en el chat (' + sockets.length + ' conex) 💬✅');
			} else {
				console.log('Hola! ' + user.nick + ' está en el chat 💬✅');
				this.connectedUsers.set(user.id, [client]);
			}

			// Meter al usuario en todas las rooms en las que este
			this.joinMyChatRooms(client, user);

			console.log("Usuarios conectados al chat: " +this.connectedUsers.size);

		} catch (error) {
			client.disconnect();
			return;
		}
	}

	async joinMyChatRooms(socket: Socket, user: any) {
		let directs = [...new Set([...user.chatDirectUser1, ...user.chatDirectUser2])];

		for (const direct of directs) {
			socket.join("room_direct_" + String(direct.id));
		}

		for (const channel of user.chatChannelUser) {
			socket.join("room_channel_" + String(channel.channelId));
		}
	}
	
	async handleDisconnect(client: Socket) {

		const userId = this.webSocketService.getUserIdFromHeaders(client.handshake.headers);
		if (!userId)
		{
			console.log('Alguien se ha ido del chat 💬❌');
			client.disconnect();
			return ;
		}

		try {
			const user = await this.userService.getUserAndChatsById(userId);

			if (this.connectedUsers.has(user.id))
			{
				const sockets: Socket[] = this.connectedUsers.get(user.id);

				const newSockets = sockets.filter((value) => value !== client);
				this.connectedUsers.set(user.id, newSockets);
				client.disconnect();
			}

			if (!user)
				console.log(userId + ' se ha ido del chat 💬❌');
			else
				console.log(user.nick + ' se ha ido del chat 💬❌');

		} catch (error) {
			client.disconnect();
		}
	}

	joinRoom(userId: number, room: string) {
		if (this.connectedUsers.has(userId)) {
			const userSockets: Socket[] = this.connectedUsers.get(userId);

			for (const socket of userSockets) {
				socket.join("room_" + room);
			}
		}
	}

	leaveRoom(userId: number, room: string) {
		if (this.connectedUsers.has(userId)) {
			const userSockets: Socket[] = this.connectedUsers.get(userId);

			for (const socket of userSockets) {
				socket.leave("room_" + room);
			}
		}
	}

	async sendSocketMessageToRoom(room: string, eventName: string, data: any) {
		this.server.to("room_" + room).emit(eventName, data);
	}

	async sendSocketMessageToUser(userId: number, eventName: string, data: any) {
		if (this.connectedUsers.has(userId)) {
			const userSockets: Socket[] = this.connectedUsers.get(userId);

			for (const socket of userSockets) {
				socket.emit(eventName, data);
			}
		}
	}

	async sendSocketMessageToAll(eventName: string, data: any) {
		this.server.emit(eventName, data);
	}

	/*
	async sendSocketMessageToRoom(room: string, eventName: string, data: any) {
		this.server.to(`room_${room}`).emit(eventName, data);
	}
	*/

	
	@SubscribeMessage('event_join')
	handleJoinRoom(client: Socket, room: string) {
		client.join("room_admin_" + room);
	}
	
	@SubscribeMessage('event_leave')
	handleRoomLeave(client: Socket, room:string) {
		client.leave("room_admin_" + room);
	}

	@OnEvent(SelfUserStateChangedEvent.name)
	handleSelfUserStateChanged(event: SelfUserStateChangedEvent) {
		this.sendSocketMessageToUser(event.user.userId, 'UPDATE_ME', event.user);
	}

	

	/*
	@SubscribeMessage('event_message') //TODO Backend
	handleIncommingMessage(client: Socket, payload: { room: string; message: string }) {
		const { room, message } = payload;

		console.log(payload)

		this.server.to(`room_${room}`).emit('new_message', message);
	}
	*/
	
}
