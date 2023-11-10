import { IsOptional, IsNumber, IsBoolean, IsSemVer, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatChannelUserDto {

	@ApiProperty()
	@IsNumber()
	id: number

	@ApiProperty()
	@IsString()
	nick: string

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	isOwner?: boolean

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	isAdmin?: boolean
}
