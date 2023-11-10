import { Controller, Get, UseGuards, Body, Delete, Post, Put } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger"
import { JwtGuard } from "../auth/guard";
import { GetJwt } from "../auth/decorator";
import { ChatService } from "./chat.service";



@UseGuards(JwtGuard)
@Controller('chats')
@ApiBearerAuth()
export class ChatController {
	
	constructor(private chatService: ChatService) { }

	@Get('')
	async getChats(@GetJwt('sub') userId: number) {
		return this.chatService.getChats(userId);
	}
}
