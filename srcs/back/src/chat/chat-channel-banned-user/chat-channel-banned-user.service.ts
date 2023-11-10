import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../../user/user.service';
import { ChatChannelService } from '../chat-channel/chat-channel.service';
import { ThrowHttpException } from '../../utils/error-handler';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatChannelBannedUserDto } from './dto'
import { ChatChannelUserService } from '../chat-channel-user/chat-channel-user.service';


@Injectable()
export class ChatChannelBannedUserService {

	constructor(private prisma: PrismaService, private userService: UserService,
				private chatChannelService: ChatChannelService,
				private chatChannelUserService: ChatChannelUserService) { }

	async banUserInChannel(userId: number, dto: ChatChannelBannedUserDto) {
		const user = await this.userService.getUserById(userId);
		const victim = await this.userService.getUserByNick(dto.nick);
		const channel = await this.chatChannelService.getChannel(dto.channel_id);

		await this.chatChannelService.checkUserIsAuthorizedInChannnel(user.id, channel.id);

		let victimChannelUser = null;
		try {
			victimChannelUser = await this.chatChannelService.getChannelUser(channel.id, victim.id);
		} catch (error) {
		}

		if (user.id == victim.id)
			ThrowHttpException(new BadRequestException, 'No puedes banearte / desbanearte a ti mismo del canal');

		if (victimChannelUser != null && victimChannelUser.isOwner)
			ThrowHttpException(new UnauthorizedException, 'No tienes permiso para banear / desbanear al propietario del canal');

		let bannedUser = await this.chatChannelService.getBannedUser(channel.id, victim.id);

		try {
			bannedUser = await this.prisma.chatChannelBannedUser.update({
				where: {
					id: bannedUser.id
				},
				data: {
					isBanned: dto.isBanned
				}
			});

			if (dto.isBanned == true) {
				this.chatChannelUserService.leaveChannel(victim.id, {id: channel.id});
			}

			this.chatChannelService.sendUpdatedChannelListToAllUsersWithSocket();

			return bannedUser;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Error al banear a un usuario');
			}
		}

	}

	async muteUserInChannel(userId: number, dto: ChatChannelBannedUserDto) {
		const user = await this.userService.getUserById(userId);
		const victim = await this.userService.getUserByNick(dto.nick);
		const channel = await this.chatChannelService.getChannel(dto.channel_id);

		await this.chatChannelService.checkUserIsAuthorizedInChannnel(user.id, channel.id);

		const victimChannelUser = await this.chatChannelService.getChannelUser(channel.id, victim.id);

		if (user.id == victim.id)
			ThrowHttpException(new BadRequestException, 'No puedes silenciarte / desilenciarte a ti mismo del canal');

		if (victimChannelUser.isOwner)
			ThrowHttpException(new UnauthorizedException, 'No tienes permiso para silenciar / desilenciar al propietario del canal');

		let bannedUser = await this.chatChannelService.getBannedUser(channel.id, victim.id);

		let currentTime = new Date().getTime();
		let mutedUntil = new Date(currentTime + (dto.isMutedSecs * 1000));

		try {
			bannedUser = await this.prisma.chatChannelBannedUser.update({
				where: {
					id: bannedUser.id
				},
				data: {
					isMutedUntil: mutedUntil
				}
			});

			return bannedUser;

		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				ThrowHttpException(error, 'Error al silenciar a un usuario');
			}
		}
	}

}
