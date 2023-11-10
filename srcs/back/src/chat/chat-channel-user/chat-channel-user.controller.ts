import { Controller, UseGuards, Body, Delete, Post } from "@nestjs/common";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../../auth/guard";
import { GetJwt } from "../../auth/decorator";
import { ChatChannelUserService } from "./chat-channel-user.service";
import { ChatChannelJoinDto, ChatChannelLeaveDto } from './dto'


@UseGuards(JwtGuard)
@Controller('chat/channels')
@ApiBearerAuth()
export class ChatChannelUserController {
	
	constructor(private chatChannelUserService: ChatChannelUserService) { }

	@Post('join')
	@ApiBody({ type: ChatChannelJoinDto })
	async joinChannel(@GetJwt('sub') userId: number, @Body() dto: ChatChannelJoinDto) {
		return this.chatChannelUserService.joinChannel(userId, dto);
	}

	@Delete('leave')
	@ApiBody({ type: ChatChannelLeaveDto })
	async leaveChannel(@GetJwt('sub') userId: number, @Body() dto: ChatChannelLeaveDto) {
		return this.chatChannelUserService.leaveChannel(userId, dto);
	}

	/*
	@Put('users')
	@ApiBody({ type: ChatChannelUserDto })
	async updateChannelUser(@GetJwt('sub') userId: number, @Body() dto: ChatChannelUserDto) {
		return this.chatChannelUserService.updateChannelUser(userId, dto);
	}

	@Delete('users')
	@ApiBody({ type: ChatChannelUserDto })
	async deleteChannelUser(@GetJwt('sub') userId: number, @Body() dto: ChatChannelUserDto) {
		return this.chatChannelUserService.deleteChannelUser(userId, dto);
	}
	*/
}
