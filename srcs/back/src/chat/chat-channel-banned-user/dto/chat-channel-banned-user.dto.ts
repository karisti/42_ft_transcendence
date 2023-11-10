import { IsString, IsNumber, IsBoolean, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ChatChannelBannedUserDto {

	@ApiProperty()
	@IsNumber()
	channel_id: number

	@ApiProperty()
	@IsString()
	nick: string

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	isBanned?: boolean

	@ApiProperty()
	@IsNumber()
	@IsOptional()
	isMutedSecs?: number
}
