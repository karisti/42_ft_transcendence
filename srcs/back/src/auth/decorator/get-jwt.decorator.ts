import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetJwt = createParamDecorator(
	(data: string | undefined, ctx: ExecutionContext) => {//change switchToWs for websocket as needed
		const request: Express.Request = ctx.switchToHttp().getRequest();
		if (data) {
			return request.user[data];
		}
		return request.user;
	},
);