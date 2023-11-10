import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatDirectDto {

	@ApiProperty()
	@IsNumber()
	user_id: number
}
