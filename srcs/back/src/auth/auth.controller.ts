import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiOkResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { SignupResponseDto } from "./dto/signup-response.dto";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Post('signup')
	@ApiBody({ type: AuthDto })
	@ApiOkResponse({ type: SignupResponseDto, description: 'Successful signup' })
	signup(@Body() dto: AuthDto) {
		return this.authService.signup(dto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('signin')
	@ApiBody({ type: AuthDto })
	signin(@Body() dto: AuthDto) {
		return this.authService.signin(dto);
	}
}
