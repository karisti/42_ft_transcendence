
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ChatGateway } from '../chat/chat-socket/chat.gateway';
import * as minimist from 'minimist';
import { AdminCommandDto } from './dto';
import { EditUserByAdminDto } from '../user/dto/edit-user.dto';
import { ThrowHttpException } from '../utils/error-handler';
import { ChatChannelUserService } from '../chat/chat-channel-user/chat-channel-user.service';
import { ChatChannelUserDto } from '../chat/chat-channel-user/dto';
import { ChatChannelService } from '../chat/chat-channel/chat-channel.service';
import { ChatChannelUpdateDto } from '../chat/chat-channel/dto';



@Injectable()
export class AdminCommandsService {
	// Objeto que mantiene un registro de todos los comandos y sus descripciones
	private commands = {
		'/help': 'Usa /help para mostrar esta lista de comandos',

		'/setsiteadmin <nick>': 'Da permisos de administador en todo la pagina a un usuario',
		'/unsetsiteadmin <nick>': 'Quita los permisos de administrador en toda la pagina',
		'/siteban <nick>': 'Banea a un usuario de toda la pagina de forma inminente',
		'/siteunban <nick>': 'Desbanea a un usuario de toda la pagina de forma inminente',
		'/setchanneladmin <channel> <nick>': 'Agrega permisos de administrador a un usuario en el canal especificado',
		'/unsetchanneladmin <channel> <nick>': 'Elimina permisos de administrador a un usuario en el canal especificado',
		'/destroychannel <channel>': 'Elimina un canal de chat del servidor'
	};

	
	constructor(private prisma: PrismaService, private userService: UserService,
					private chatChannelUserService: ChatChannelUserService,
					private chatChannelService: ChatChannelService,
					private ws: ChatGateway, ) { }

	
	private parseCommand(dto: AdminCommandDto) {
		
		let words = dto.message.split(' ');
		let command = words[0];

		// Elimina el primer elemento del array (el comando)
		words.shift();

		let args = minimist(words);

		return { command, args };
	}

	
	private handleCommand(adminUser: any, dto: AdminCommandDto, command: string, args: string[]) {
		console.log('User ID: ' + adminUser.id);
		console.log('Command: ' + command);
		console.log('Args: ' + String(args[0]));

		switch (command) {
			case '/help':
				// Si el comando es /help, mostrar la lista de comandos
				console.log('Lista de comandos:');
				for (let cmd in this.commands) {
					console.log(cmd + ' - ' + this.commands[cmd]);
				}
				break;

			case '/setsiteadmin':
				const setSiteAdminDto: EditUserByAdminDto = { 'nick': String(args[0]), 'isSiteAdmin': true };
				return this.setSiteAdmin(adminUser, setSiteAdminDto);

			case '/unsetsiteadmin':
				const unsetSiteAdminDto: EditUserByAdminDto = { 'nick': String(args[0]), 'isSiteAdmin': false };
				return this.unsetSiteAdmin(adminUser, unsetSiteAdminDto);

			case '/siteban':
				const siteBanDto: EditUserByAdminDto = { 'nick': String(args[0]), 'isBanned': true, 'isVerified2fa': false };
				return this.siteBan(adminUser, siteBanDto);

			case '/siteunban':
				const siteUnbanDto: EditUserByAdminDto = { 'nick': String(args[0]), 'isBanned': false };
				return this.siteUnban(adminUser, siteUnbanDto);

			case '/setchanneladmin':
				const setAdminUserDto: any = {
					channelName: String(args[0]),
					nick: String(args[1]),
					isAdmin: true
				};
				return this.setAdminInChannel(adminUser, setAdminUserDto);

			case '/unsetchanneladmin':
				const unsetAdminUserDto: any = {
					channelName: String(args[0]),
					nick: String(args[1]),
					isAdmin: false
				};
				return this.unsetAdminInChannel(adminUser, unsetAdminUserDto);

			case '/destroychannel':
				const destroyChannelDto: any = {
					channelName: String(args[0])
				};
				return this.destroyChannel(adminUser, destroyChannelDto);
			default:
				console.log('Comando no reconocido');
				return { commandExecuted: true, response: 'Comando no reconocido', error: true };
		}
	}

	
	executeCommand(user: any, dto: AdminCommandDto) {
		let command = this.parseCommand(dto);
		return this.handleCommand(user, dto, command.command, command.args._);
	}

	
	private async setSiteAdmin(adminUser: any, dto: EditUserByAdminDto) {
		try {
			if (!adminUser.isSiteOwner)
				ThrowHttpException(new UnauthorizedException, 'Necesitas ser propietario del sitio para nombrar administradores');

			await this.userService.editUserBySiteAdmin(adminUser, dto);
			return { commandExecuted: true, response: 'Has hecho admin a ' + dto.nick, error: false };
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}

	private async unsetSiteAdmin(adminUser: any, dto: EditUserByAdminDto) {
		try {
			if (!adminUser.isSiteOwner)
				ThrowHttpException(new UnauthorizedException, 'Necesitas ser propietario del sitio para quitar administradores');

			await this.userService.editUserBySiteAdmin(adminUser, dto);
			return { commandExecuted: true, response: 'Has quitado el admin a ' + dto.nick, error: false };
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}

	private async siteBan(adminUser: any, dto: EditUserByAdminDto) {
		try {
			const victim = await this.userService.getUserByNick(dto.nick);
			if (victim.isSiteOwner || victim.isSiteAdmin)
				ThrowHttpException(new UnauthorizedException, 'No puedes echar a otros administradores');
			
			if (!adminUser.isSiteOwner && !adminUser.isSiteAdmin)
				ThrowHttpException(new UnauthorizedException, 'Necesitas ser propietario o admin del sitio para banear usuarios');

			await this.userService.editUserBySiteAdmin(adminUser, dto);
			return { commandExecuted: true, response: 'Has baneado del sitio a ' + dto.nick, error: false };
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}

	private async siteUnban(adminUser: any, dto: EditUserByAdminDto) {
		try {
			const victim = await this.userService.getUserByNick(dto.nick);
			if (victim.isSiteOwner || victim.isSiteAdmin)
				ThrowHttpException(new UnauthorizedException, 'No puedes echar a otros administradores');

			if (!adminUser.isSiteOwner && !adminUser.isSiteAdmin)
				ThrowHttpException(new UnauthorizedException, 'Necesitas ser propietario o admin del sitio para desbanear usuarios');

			await this.userService.editUserBySiteAdmin(adminUser, dto);
			return { commandExecuted: true, response: 'Has desbaneado del sitio a ' + dto.nick, error: false };
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}

	private async setAdminInChannel(adminUser: any, dto: any) {
		try {
			const channel = await this.chatChannelService.getChannelByName(dto.channelName);

			const chatChannelUserDto: ChatChannelUserDto = {
				id: channel.id,
				nick: dto.nick,
				isAdmin: true
			}
			await this.chatChannelUserService.updateChannelUser(adminUser.id, chatChannelUserDto, adminUser.isSiteAdmin);
			
			return {
				commandExecuted: true,
				response: 'Has hecho administrador del canal ' + dto.channelName + ' a ' + dto.nick,
				error: false
			};
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}

	private async unsetAdminInChannel(adminUser: any, dto: any) {
		try {
			const channel = await this.chatChannelService.getChannelByName(dto.channelName);

			const chatChannelUserDto: ChatChannelUserDto = {
				id: channel.id,
				nick: dto.nick,
				isAdmin: false
			}
			await this.chatChannelUserService.updateChannelUser(adminUser.id, chatChannelUserDto, adminUser.isSiteAdmin);
			
			return {
				commandExecuted: true,
				response: 'Has quitado administrador del canal ' + dto.channelName + ' a ' + dto.nick,
				error: false
			};
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}

	private async destroyChannel(adminUser: any, dto: any) {
		try {
			const channel = await this.chatChannelService.getChannelByName(dto.channelName);

			const chatChannelDto: ChatChannelUpdateDto = {
				id: channel.id,
			}
			await this.chatChannelService.deleteChannel(adminUser.id, chatChannelDto, adminUser.isSiteAdmin);
			
			return {
				commandExecuted: true,
				response: 'Has borrado el canal ' + dto.channelName,
				error: false
			};
		} catch (error) {
			return { commandExecuted: true, response: error.response.message, error: true };
		}
	}


}

