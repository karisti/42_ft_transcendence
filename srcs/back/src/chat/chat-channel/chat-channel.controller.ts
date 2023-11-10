import { Controller, Get, UseGuards, Body, Post, Query } from "@nestjs/common";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guard";
import { GetJwt } from "../../auth/decorator";
import { ChatChannelService } from "./chat-channel.service";
import { ChatChannelCreateDto } from "./dto";



@UseGuards(JwtGuard)
@Controller('chat/channels')
@ApiBearerAuth()
export class ChatChannelController {
	
	constructor(private chatChannelService: ChatChannelService) { }

	@Get()
	async getChannelChat(@GetJwt('sub') userId: number, @Query('channelId') channelId: string) {
		return this.chatChannelService.getChannelChat(userId, Number(channelId));
	}

	@Post()
	@ApiBody({ type: ChatChannelCreateDto })
	async createChannel(@GetJwt('sub') userId: number, @Body() dto: ChatChannelCreateDto) {
		return this.chatChannelService.createChannel(userId, dto);
	}

	/*
	@Put()
	@ApiBody({ type: ChatChannelUpdateDto })
	async updateChannel(@GetJwt('sub') userId: number, @Body() dto: ChatChannelUpdateDto) {
		return this.chatChannelService.updateChannel(userId, dto);
	}

	@Delete()
	@ApiBody({ type: ChatChannelUpdateDto })
	async deleteChannel(@GetJwt('sub') userId: number, @Body() dto: ChatChannelUpdateDto) {
		return this.chatChannelService.deleteChannel(userId, dto);
	}
	*/
}
