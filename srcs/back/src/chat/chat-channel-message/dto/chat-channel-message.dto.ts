import { IsString, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatChannelMessageDto {

	@ApiProperty()
	@IsNumber()
	channel_id: number

	@ApiProperty()
	@IsString()
	message: string
}
