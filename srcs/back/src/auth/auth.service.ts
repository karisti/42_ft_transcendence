import { ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { ThrowHttpException } from "../utils/error-handler";
import { SignupResponseDto } from "./dto/signup-response.dto";
import { speakeasy } from "speakeasy";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService
	) { }
	async signin(dto: AuthDto) {
		//find user by email
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});
		//if user does not exist, throw exception
		if (!user) ThrowHttpException(new ForbiddenException, 'Credentials incorrect');

		//compare passwords
		const pwMatches = await argon.verify(user.hash, dto.password);
		//if password does not match, throw exception
		if (!pwMatches) ThrowHttpException(new ForbiddenException, 'Credentials incorrect');

		if(user.secondFactorSecret) {
			const otpCode = dto.otpCode;
			const isOtpValid = speakeasy.totp.verify({
				secret: user.secondFactorSecret,
				encoding: 'base32',
				token: otpCode,
			});

			if(!isOtpValid){
				ThrowHttpException(new ForbiddenException, '2AF failed');
			}
		}

		//send back the user
		return this.signToken(user.id, user.email);
	}
	async signup(dto: AuthDto) {
		//generate password hash
		const hash = await argon.hash(dto.password);
		//save new user in db
		try {
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					nick: dto.nick,
					login: dto.nick,
					hash: hash,
				},
			})
			return this.signToken(user.id, user.email);
		}
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				// https://www.prisma.io/docs/reference/api-reference/error-reference
				// P2002 "Unique constraint failed on the {constraint}"
				ThrowHttpException(error, 'Credentials taken');
			}
			throw error;
		}
	}

	async signToken(userId: number, email: string): Promise<SignupResponseDto> {
		const payload = {
			sub: userId,
			email,
		};
		const secret = this.config.get('JWT_SECRET');
		const token = await this.jwt.signAsync(payload, {
			expiresIn: '120m',
			secret: secret
		});

		return {
			access_token: token,
		};
	}
}
