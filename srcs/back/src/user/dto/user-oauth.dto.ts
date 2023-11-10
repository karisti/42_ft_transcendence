import { IsEmail, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"

export class UserOAuthDto {
	@ApiProperty()
	@IsEmail()
	@IsOptional()
	email?: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	login?: string

	@ApiProperty()
	@IsString()
	@IsOptional()
	avatar?: string

}