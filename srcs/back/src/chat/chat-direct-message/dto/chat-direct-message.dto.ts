import { IsString, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatDirectMessageDto {

	@ApiProperty()
	@IsNumber()
	user_id: number

	@ApiProperty()
	@IsString()
	message: string
}
