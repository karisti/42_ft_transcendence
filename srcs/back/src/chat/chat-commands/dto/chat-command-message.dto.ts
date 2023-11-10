import { IsString, IsNumber, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatCommandMessageDto {

	@ApiProperty()
	@IsBoolean()
	isDirect: boolean

	@ApiProperty()
	@IsNumber()
	chat_id: number

	@ApiProperty()
	@IsString()
	message: string
}
