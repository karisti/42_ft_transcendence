import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
	constructor(config: ConfigService) {
		super({
			datasources: {
				db: {
					url: config.get("DATABASE_URL"),
				}
			}
		});
	}
	async cleanDb() {
		return this.$transaction([
			this.user.deleteMany(),
			this.friend.deleteMany(),
			this.chatChannel.deleteMany(),
			this.chatChannelUser.deleteMany(),
			this.chatChannelMessage.deleteMany(),
			this.chatChannelBannedUser.deleteMany(),
			this.chatDirect.deleteMany(),
			this.chatDirectMessage.deleteMany(),
			this.chatBlockedUser.deleteMany(),
			this.gameMatch.deleteMany(),
		]);
	}
}
