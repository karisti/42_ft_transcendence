import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserByAdminDto, UserProfileUpdateDto } from '../src/user/dto';
import { readFileSync } from "fs";
import { File } from "buffer";

describe('App e2e', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, }));
		await app.init();
		await app.listen(3000);
		prisma = app.get(PrismaService);
		pactum.request.setBaseUrl('http://localhost:3000');
		await prisma.cleanDb();
	});
	afterAll(() => {
		app.close();
	});

	describe('Auth', () => {
		const dto: AuthDto = {
			email: 'test@testapp.com',
			password: '123',
			nick: 'testuser'
		}
		const dtoDel: AuthDto = {
			email: 'test2@testapp.com',
			password: '321',
			nick: 'testuser2'
		}
		const dto1: AuthDto = {
			email: 'test3@testapp.com',
			password: '123',
			nick: 'testuser3'
		}
		const dto2: AuthDto = {
			email: 'test4@testapp.com',
			password: '123',
			nick: 'testuser4'
		}
		const dto3: AuthDto = {
			email: 'test5@testapp.com',
			password: '123',
			nick: 'testuser5'
		}
		describe('Signup', () => {
			it('should throw if no body', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.expectStatus(400);
			})
			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						password: dto.password,
						nick: dto.nick
					})
					.expectStatus(400);
			});
			it('should throw if not email', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						password: dto.password,
						email: 'bademail',
						nick: dto.nick
					})
					.expectStatus(400);
			});
			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						email: dto.email,
						nick: dto.nick
					})
					.expectStatus(400);
			})
			it('should sign up', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto)
					.expectStatus(201);
			});
			it('should sign up', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dtoDel)
					.expectStatus(201);
			});
			it('should sign up', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto1)
					.expectStatus(201);
			});
			
			it('should sign up', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto2)
					.expectStatus(201);
			});
			it('should sign up', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto3)
					.expectStatus(201);
			});
		});
		describe('Signin', () => {
			it('should throw if no body', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.expectStatus(400);
			})
			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({
						password: dto.password,
						nick: dto.nick
					})
					.expectStatus(400);
			});
			it('should throw if not email', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({
						password: dto.password,
						email: 'bademail',
						nick: dto.nick
					})
					.expectStatus(400);
			});
			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody({
						email: dto.email,
						nick: dto.nick
					})
					.expectStatus(400);
			})
			it('should sign in', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto)
					.expectStatus(200)
					.stores('userAt', 'access_token');
			});
			it('should sign in', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto1)
					.expectStatus(200)
					.stores('userAt1', 'access_token');
			});
			it('should sign in', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto2)
					.expectStatus(200)
					.stores('userAt2', 'access_token');
			});
			it('should sign in', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dtoDel)
					.expectStatus(200)
					.stores('userAtDel', 'access_token');
			});
		});

	});
	describe('User', () => {
		describe('DeleteUser', () => {
			it('should delete user', () => {
				return pactum
					.spec()
					.delete('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAtDel}',
					})
					.expectStatus(200)
			});
			it('should throw 404 if user not found', () => {
				return pactum
					.spec()
					.delete('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAtDel}',
					})
					.expectStatus(404)
			});
		})
		/*
		describe('EditUser', () => {
			const dto: EditUserByAdminDto = {
				nick: "miki@42mars.com"
			}
			it('should edit user', () => {
				return pactum
					.spec()
					.patch('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody(dto)
					.expectStatus(200)
					.expectBodyContains(dto.email);
			});
			it('should throw 404 if user not found', () => {
				return pactum
					.spec()
					.patch('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAtDel}',
					})
					.withBody(dto)
					.expectStatus(404)
			});
		});
		*/
		describe('GetMe', () => {
			it('should get current user', () => {
				return pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(200)
			});
			it('should throw 404 if user not found', () => {
				return pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAtDel}',
					})
					.expectStatus(404)
			});
		});
		describe('Profile', () => {
			describe('getProfileData', () => {
				const dto = {
					nick: "testuser"
				}
				it('should get user profile', () => {
					return pactum
						.spec()
						.get('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.expectStatus(200)
						.expectBodyContains(dto.nick)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.get('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.get('/users/profile')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			describe('updateProfileData', () => {
				const dto = {
					nick: "kar-is_tii"
				}
				it('should update user profile data', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody(dto)
						.expectStatus(200)
						.expectBodyContains(dto.nick)
				});
				it('should throw 400 if user nick is empty', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: ""
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick length is lower than 3', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick length is greater than 10', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaaaaaaaaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick doesnt fulfill the next regex: [a-zA-Z0-9-_]', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaa.aaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick doesnt fulfill the next regex: [a-zA-Z0-9-_]', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaa aaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick doesnt fulfill the next regex: [a-zA-Z0-9-_]', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaa*aaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick doesnt fulfill the next regex: [a-zA-Z0-9-_]', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaa	aaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick doesnt fulfill the next regex: [a-zA-Z0-9-_]', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaa/aaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if user nick doesnt fulfill the next regex: [a-zA-Z0-9-_]', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaa,aaa"
						})
						.expectStatus(400)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.withBody(dto)
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.put('/users/profile')
						.withHeaders({
							Authorization: '',
						})
						.withBody(dto)
						.expectStatus(401)
				});
			});
			describe('deleteProfilePicture', () => {
				it('should delete user profile picture', () => {
					return pactum
						.spec()
						.delete('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.expectBodyContains('default.jpg')
						.expectStatus(200)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.delete('/users/profile')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.delete('/users/profile')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
		});
		describe('Friend', () => {
			describe('addFriend', () => {
				const dto = {
					nick: "kar-is_tii"
				}
				const dto1 = {
					nick: "testuser3"
				};
				const dto2 = {
					nick: "testuser4"
				};
				const dto3 = {
					nick: "testuser5"
				};
				it('should add friend 1', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto1
						})
						.expectStatus(201)
						.expectBodyContains("[]")
				});
				it('should add friend 2', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto2
						})
						.expectStatus(201)
						.expectBodyContains("[]")
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.withBody({
							...dto3
						})
						.expectStatus(404)
				});
				it('should throw 404 if friend user not found', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "notuser"
						})
						.expectStatus(404)
				});
				it('should throw 400 if friend is same user', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto
						})
						.expectStatus(400)
				});
				it('should throw 400 if friendship already exists', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto1
						})
						.expectStatus(400)
				});
				it('should throw 400 if nick not provided', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (short)', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (large)', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaaaaaaaaaaaaaaaaaaaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (bad characters)', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaa aa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (bad characters)', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaa;aa"
						})
						.expectStatus(400)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.post('/users/friends')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			describe('getFriendRequests', () => {
				const dto = {
					nick: "kar-is_tii"
				}
				const dto1 = {
					nick: "testuser3"
				};
				const dto2 = {
					nick: "testuser4"
				};
				it('should get friends requests', () => {
					return pactum
						.spec()
						.get('/users/friends/requests')
						.withHeaders({
							Authorization: 'Bearer $S{userAt1}',
						})
						.expectStatus(200)
						.expectBodyContains(dto.nick)
				});
				it('should get friends requests', () => {
					return pactum
						.spec()
						.get('/users/friends/requests')
						.withHeaders({
							Authorization: 'Bearer $S{userAt2}',
						})
						.expectStatus(200)
						.expectBodyContains(dto.nick)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.get('/users/friends/requests')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.get('/users/friends/requests')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			describe('acceptFriend', () => {
				const dto = {
					nick: "kar-is_tii"
				}
				const dto1 = {
					nick: "testuser3"
				};
				const dto2 = {
					nick: "testuser4"
				};
				const dto3 = {
					nick: "testuser5"
				};
				it('friend 1 should not have any friend', () => {
					return pactum
						.spec()
						.get('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt1}',
						})
						.withBody({
							...dto
						})
						.expectStatus(200)
						.expectBodyContains("[]")
				});
				it('should accept friend 1', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt1}',
						})
						.withBody({
							...dto
						})
						.expectStatus(200)
						.expectBodyContains(dto.nick)
				});
				it('friend 1 should also have the other user as friend', () => {
					return pactum
						.spec()
						.get('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto
						})
						.expectStatus(200)
						.expectBodyContains(dto1.nick)
				});
				it('should accept friend 2', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt2}',
						})
						.withBody({
							...dto
						})
						.expectStatus(200)
						.expectBodyContains(dto.nick)
				});
				it('should not have reamining friend requests', () => {
					return pactum
						.spec()
						.get('/users/friends/requests')
						.withHeaders({
							Authorization: 'Bearer $S{userAt1}',
						})
						.expectStatus(200)
						.expectBodyContains("[]")
				});
				it('should not have reamining friend requests', () => {
					return pactum
						.spec()
						.get('/users/friends/requests')
						.withHeaders({
							Authorization: 'Bearer $S{userAt2}',
						})
						.expectStatus(200)
						.expectBodyContains("[]")
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.withBody({
							...dto3
						})
						.expectStatus(404)
				});
				it('should throw 404 if friend user not found', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "notuser"
						})
						.expectStatus(404)
				});
				it('should throw 400 if nick not provided', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (short)', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (large)', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaaaaaaaaaaaaaaaaaaaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (bad characters)', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaa aa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (bad characters)', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaa;aa"
						})
						.expectStatus(400)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.put('/users/friends')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			describe('getFriends', () => {
				const dto1 = {
					nick: "testuser3"
				};
				const dto2 = {
					nick: "testuser4"
				};
				it('should get friends', () => {
					return pactum
						.spec()
						.get('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.expectStatus(200)
						.expectBodyContains(dto1.nick)
						.expectBodyContains(dto2.nick)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.get('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.get('/users/friends')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			describe('deleteFriend', () => {
				const dto1 = {
					nick: "testuser3"
				};
				const dto2 = {
					nick: "testuser4"
				};
				it('should delete friend 1', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto1
						})
						.expectStatus(200)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.withBody({
							...dto2
						})
						.expectStatus(404)
				});
				it('should delete friend 2', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto2
						})
						.expectStatus(200)
				});
				it('should not have friends', () => {
					return pactum
						.spec()
						.get('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.expectStatus(200)
						.expectBodyContains("[]")
				});
				it('should not have friends', () => {
					return pactum
						.spec()
						.get('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt1}',
						})
						.expectStatus(200)
						.expectBodyContains("[]")
				});
				/*
				it('should throw 404 if friendship not found', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							...dto2
						})
						.expectStatus(404)
				});
				*/
				it('should throw 404 if friend user not found', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "notuser"
						})
						.expectStatus(404)
				});
				it('should throw 400 if nick not provided', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (short)', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (large)', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaaaaaaaaaaaaaaaaaaaaa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (bad characters)', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaa aa"
						})
						.expectStatus(400)
				});
				it('should throw 400 if bad format nick provided (bad characters)', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							nick: "aaa;aa"
						})
						.expectStatus(400)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.delete('/users/friends')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
		});
	});
	describe('Uploads', () => {
		describe('serveImage', () => {
			it('should get user profile picture', () => {
				return pactum
					.spec()
					.get('/uploads/avatars/test')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(200)
			});
			it('should throw 404 if user not found', () => {
				return pactum
					.spec()
					.get('/uploads/avatars/test')
					.withHeaders({
						Authorization: 'Bearer $S{userAtDel}',
					})
					.expectStatus(404)
			});
			it('should throw 401 if jwt token not provided', () => {
				return pactum
					.spec()
					.get('/uploads/avatars/test')
					.withHeaders({
						Authorization: '',
					})
					.expectStatus(401)
			});
		});
	});

	describe('Chat', () => {
		describe('Chat Channel endpoints', () => {
			describe('POST /chat/channels', () => {
				it('should create public channel', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "42_madrid"
						})
						.expectStatus(201)
						.expectBodyContains("42_madrid")
						.expectBodyContains("false")
						.stores('channelId1', 'id');
				});
				it('should create public channel', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "42_barcelona",
							password: ""
						})
						.expectStatus(201)
						.expectBodyContains("42_barcelona")
						.expectBodyContains("false")
						.stores('channelId2', 'id');
				});
				it('should create private channel', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "42_urduliz",
							password: "aasd"
						})
						.expectStatus(201)
						.expectBodyContains("42_urduliz")
						.expectBodyContains("true")
						.stores('channelId3', 'id');
				});
				it('should throw 400 if duplicate channel name', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "42_madrid"
						})
						.expectStatus(400)
				});
				it('should throw 400 if invalid channel name', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "adsd s"
						})
						.expectStatus(400)
				});
				it('should throw 400 if invalid channel name', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "ds"
						})
						.expectStatus(400)
				});
				it('should throw 400 if invalid channel name', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "ddasadsasdadsasdasasdasdadsadsadsadsasds"
						})
						.expectStatus(400)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.withBody({
							name: "aaaaa"
						})
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.post('/chat/channels')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			/*
			describe('PUT /chat/channels', () => {
				it('should change channel name', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: "$S{channelId1}",
							name: "42_nomadrid"
						})
						.expectStatus(200)
						.expectBodyContains("42_nomadrid")
						.expectBodyContains("false")
				});
				it('should become channel public', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: "$S{channelId3}",
							password: ""
						})
						.expectStatus(200)
						.expectBodyContains("42_urduliz")
						.expectBodyContains("false")
				});
				it('should become channel private', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: "$S{channelId3}",
							password: "aasd"
						})
						.expectStatus(200)
						.expectBodyContains("42_urduliz")
						.expectBodyContains("true")
				});
				it('should become channel public', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: "$S{channelId3}",
						})
						.expectStatus(200)
						.expectBodyContains("42_urduliz")
						.expectBodyContains("false")
				});
				it('should throw 400 if duplicate channel name', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: "$S{channelId1}",
							name: "42_urduliz"
						})
						.expectStatus(400)
				});
				it('should throw 400 if channel id not provided', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							name: "asdasdaasd"
						})
						.expectStatus(400)
				});
				it('should throw 401 if user not channel owner', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt1}',
						})
						.withBody({
							id: "$S{channelId1}",
						})
						.expectStatus(401)
				});
				it('should throw 404 if invalid channel id', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: 123,
						})
						.expectStatus(404)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.withBody({
							id: "$S{channelId1}",
						})
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.put('/chat/channels')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			describe('DELETE /chat/channels', () => {
				it('should delete channel', () => {
					return pactum
						.spec()
						.delete('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: "$S{channelId1}",
						})
						.expectStatus(200)
						.expectBodyContains("42_nomadrid")
				});
				it('should throw 400 if channel id not provided', () => {
					return pactum
						.spec()
						.delete('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.expectStatus(400)
				});
				it('should throw 401 if user not channel owner', () => {
					return pactum
						.spec()
						.delete('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt1}',
						})
						.withBody({
							id: "$S{channelId3}",
						})
						.expectStatus(401)
				});
				it('should throw 404 if invalid channel id', () => {
					return pactum
						.spec()
						.delete('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAt}',
						})
						.withBody({
							id: 1111,
						})
						.expectStatus(404)
				});
				it('should throw 404 if user not found', () => {
					return pactum
						.spec()
						.delete('/chat/channels')
						.withHeaders({
							Authorization: 'Bearer $S{userAtDel}',
						})
						.withBody({
							id: "$S{channelId3}",
						})
						.expectStatus(404)
				});
				it('should throw 401 if jwt token not provided', () => {
					return pactum
						.spec()
						.delete('/chat/channels')
						.withHeaders({
							Authorization: '',
						})
						.expectStatus(401)
				});
			});
			*/
		});
		
	});
	
});
