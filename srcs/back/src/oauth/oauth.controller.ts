import { Get, Controller, Query, Res} from "@nestjs/common";
import { OAuthService} from "./oauth.service";
import { ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { OAuthDto } from "./dto";
import { UserOAuthDto } from "../user/dto/user-oauth.dto";
import { ThrowHttpException } from "../utils/error-handler";
import { UserService } from "../user/user.service";
import { ConfigService } from "@nestjs/config";

@Controller('oauth')
@ApiBearerAuth()
export class OAuthController {
    constructor(private config: ConfigService, private oAuthService: OAuthService, private userService: UserService){}

    @Get('generateAuthURL')
    generateAuthURL() {
        const authorizationUrl = this.oAuthService.generateAuthorizationUrl();
        return { url: authorizationUrl };
    }

    @Get('getAuthToken')
    @ApiBody({type: OAuthDto})
    async getAuthToken(@Res() res, @Query('code') code: string) {
        const accessToken = await this.oAuthService.exchangeAuthorizationCode(code);
        const userInfo = await this.oAuthService.fetchUserInfo(accessToken);
        let user42: UserOAuthDto = {
            login: userInfo.login,
            email: userInfo.email,
            avatar: userInfo.image.versions.small,
        };
        
        try {
            const user = await this.oAuthService.signup(user42);

            if (user.secondFactorSecret)
                return res.redirect('http://' + this.config.get('REACT_APP_SERVER_ADDRESS') + '/verify2fa?id=' + user.id);
            
            let { access_token } = await this.oAuthService.signToken(user.id, user.email);
            return res.redirect('http://' + this.config.get('REACT_APP_SERVER_ADDRESS') + '/register?token=' + access_token);
            
        } catch (error) {
            return res.redirect('http://' + this.config.get('REACT_APP_SERVER_ADDRESS') + '/denied');
        }
    }
}


