import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatChannelLeaveDto {

	@ApiProperty()
	@IsNumber()
	id: number
}
