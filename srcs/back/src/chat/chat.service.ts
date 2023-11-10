import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatBlockedUserService } from './chat-blocked-user/chat-blocked-user.service';
import { ChatChannelService } from '../chat/chat-channel/chat-channel.service';


@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService,
					private chatBlockedUserService: ChatBlockedUserService,
					private chatChannelService: ChatChannelService) { }

	async getChats(userId: number) {
		const blockedUsers = await this.chatBlockedUserService.getMyBlockedUsersList(userId);
		const channels = await this.chatChannelService.getMyChannelsAndPublicChannels(userId);

		return {
			channels: channels,
			blocked_users: blockedUsers
		};
	}

}
