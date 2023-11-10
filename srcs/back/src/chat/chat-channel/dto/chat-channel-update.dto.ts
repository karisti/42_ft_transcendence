import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"
import { IsChannelName } from '../../../utils/decorators/is-channel-name.decorator';

export class ChatChannelUpdateDto {

	@ApiProperty()
	@IsNumber()
	id: number

	@ApiProperty()
	@IsString()
	@MinLength(3)
	@MaxLength(15)
	@IsChannelName()
	@IsOptional()
	name?: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	password?: string
}
