import { IsString, IsOptional, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatChannelJoinDto {

	@ApiProperty()
	@IsString()
	name: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	password?: string
}
