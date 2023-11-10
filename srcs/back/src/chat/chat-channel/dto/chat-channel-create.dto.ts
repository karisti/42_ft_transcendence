import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"
import { IsChannelName } from '../../../utils/decorators/is-channel-name.decorator';

export class ChatChannelCreateDto {

	@ApiProperty()
	@IsString()
	@MinLength(3)
	@MaxLength(15)
	@IsChannelName()
	name: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	password?: string
}
