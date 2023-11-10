import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsChannelName(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isChannelName',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
				const channelNameRegex = /^[a-zA-Z0-9-_]+$/; // Regular expression for channel name validation
				if (typeof value !== 'string' || !channelNameRegex.test(value)) {
					return false;
				}
				return true;
				},
				defaultMessage(args: ValidationArguments) {
				return `${args.property} must be a valid channel name consisting of letters, numbers, hyphens, and underscores.`;
				},
			},
		});
	};
}
