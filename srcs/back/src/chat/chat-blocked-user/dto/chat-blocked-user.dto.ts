import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatBlockedDto {

	@ApiProperty()
	@IsString()
	nick: string
}
