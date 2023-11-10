import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';


@Module({
    controllers: [OAuthController],
    providers: [OAuthService, JwtService, UserService]
})
export class OAuthModule{}
