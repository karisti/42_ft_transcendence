import { Module } from '@nestjs/common';
import { SecondAuthFactorController } from './second-auth-factor.controller';
import { SecondAuthFactorService } from './second-auth-factor.service';
import { OAuthService } from '../../oauth/oauth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from "../../user/user.service";

@Module({
    controllers: [SecondAuthFactorController],
    providers: [SecondAuthFactorService, OAuthService, JwtService, UserService],
  })
  export class SecondAuthFactorModule {}