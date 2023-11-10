import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'

export class AuthDto {
	@ApiProperty()
	@IsEmail()
	@IsNotEmpty()
	email: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	password: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	nick: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	otpCode?: string
}
