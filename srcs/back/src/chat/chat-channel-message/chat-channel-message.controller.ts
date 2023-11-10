import { Controller, UseGuards, Body, Post } from "@nestjs/common";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guard";
import { GetJwt } from "../../auth/decorator";
import { ChatChannelMessageService } from "./chat-channel-message.service";
import { ChatChannelMessageDto } from './dto'


@UseGuards(JwtGuard)
@Controller('chat/channels')
@ApiBearerAuth()
export class ChatChannelMessageController {
	
	constructor(private chatChannelMessageService: ChatChannelMessageService) { }

	@Post('message')
	@ApiBody({ type: ChatChannelMessageDto })
	async sendChannelMessage(@GetJwt('sub') userId: number, @Body() dto: ChatChannelMessageDto) {
		return this.chatChannelMessageService.sendChannelMessage(userId, dto);
	}
}
