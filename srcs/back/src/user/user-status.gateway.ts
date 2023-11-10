import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from "@nestjs/config";
import { UserService } from "./user.service";
import { WebSocketService } from '../auth/websocket/websocket.service';
import { OnEvent } from '@nestjs/event-emitter';
import { UserStateChangedEvent } from './user.events';

@WebSocketGateway(8081, {
	cors: {
		// origin: ['http://localhost']
		origin: '*'
	},
})
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;
	
	constructor(private config: ConfigService, private userService: UserService,
				private webSocketService: WebSocketService) { }

	afterInit(server: any) { }
	
	async handleConnection(client: any, ...args: any[]) {
		const userId = this.webSocketService.getUserIdFromHeaders(client.handshake.headers);

		if (userId == null)
		{
			client.disconnect();
			return;
		}

		try {
			const user = await this.userService.setUserStatus(userId, true);

			if (user == null)
			{
				client.disconnect();
				return;
			}

			this.sendSocketMessageToAll('UPDATE_USER', user);

			console.log('Hola! ' + user.nick + ' está online ✅');
			
		} catch (error) {
			client.disconnect();
		}
	}
	
	async handleDisconnect(client: any) {
		const userId = this.webSocketService.getUserIdFromHeaders(client.handshake.headers);
		if (userId == null)
		{
			console.log('Alguien se ha ido del sitio ❌');
			client.disconnect();
			return;
		}

		try {
			const user = await this.userService.setUserStatus(userId, false);

			if (user == null)
			{
				client.disconnect();
				return;
			}

			this.sendSocketMessageToAll('UPDATE_USER', user);

			console.log(user.nick + ' está offline ❌');
		} catch (error) {
			client.disconnect();
		}
	}

	async sendSocketMessageToAll(eventName: string, data: any) {
		this.server.emit(eventName, data);
	}

	@OnEvent(UserStateChangedEvent.name)
	handleUserStateChanged(event: UserStateChangedEvent) {
		this.sendSocketMessageToAll('UPDATE_USER', event.user);
	}
}
