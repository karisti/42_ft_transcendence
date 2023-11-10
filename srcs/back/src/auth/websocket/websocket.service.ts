import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { verify } from 'jsonwebtoken';
import { UserService } from '../../user/user.service';


@Injectable()
export class WebSocketService {
	constructor(private userService: UserService, private config: ConfigService) { }

	getUserIdFromHeaders(headers: any) {
		const jwtToken = this.extractTokenFromSocketHeaders(headers);

		const userId = this.getUserIdFromToken(jwtToken);
		return userId;
	}

	private extractTokenFromSocketHeaders(headers: any): string | null {
		try {
			const auth_token: string = headers.authorization.split(" ")[1];
		
			return (auth_token);
		} catch (error) {
			return null
		}
		
	}

	private getUserIdFromToken(jwtToken: string) {
		if (!jwtToken) // Token is missing, close the connection
		{
			return null;
		}

		try {
			const decoded = verify(jwtToken, this.config.get('JWT_SECRET'));
			const userId = Number(decoded.sub);
			
			if (!this.userService.doesUserExit(userId)) { // Invalid user, close the connection
				return null;
			}
			return userId;
		} catch (error) { // Invalid token, close the connection
			return null;
		}
	}
}
