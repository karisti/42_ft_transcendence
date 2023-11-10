# ft_transcendence

## Description
Final 42 School Common Core project. It consists of creating a real-time online pong contest website. To do this, we have developed the frontend, the backend and the docker compose that makes everything easier to run. Developed by @gpernas-, @karisti-, @mrosario, @aggarcia and @omercade.

https://github.com/karisti/42_ft_transcendence/assets/33479154/e664bdb4-2c8a-4279-99d9-5ef69f2129e0

This project include the following features:
- Online Pong:
  - Matchmaking
  - Game spectating
  - Match history
  - Leaderboard
- Chat system:
  - Channels (with administation features)
  - Direct messages
  - Friend list / blocks
  - Game invites
  - User status (connected, disconnected, playing a match, ...)
- User profile:
  - Uploadable profile picture
  - Changeable username
- Authentication and security:
  - 42 Intranet OAuth
  - 2FA using TOTP
- Administration panel:
  - Set / unset site admins
  - Manage channels
  - Ban / unban users from site

## Prerequisites
- Docker
- 42 Intranet access for API key

## Usage
1. Create `.env` file with corresponding values
2. Run `docker-compose up --build`
3. Go to `http://localhost:3001` (or the URL set on .env file)

## Lessons
- Nest JS API creation
- React JS, React-Router
- PostgreSQL, Prisma ORM
- Docker Compose
- Real time communication with Websockets
- File upload / checking
- OAuth
- 2FA using TOTP
- User management

## Resources
- [NestJs Course for Beginners - Create a REST API (YouTube)](https://www.youtube.com/watch?v=GHTA143_b-s "NestJs Course for Beginners - Create a REST API (YouTube)")
- [NestJS ¿Como usar socketio websocket? para crear un chat en tiempo real (YouTube)](https://www.youtube.com/watch?v=geGcMSCtDVk "NestJS ¿Como usar socketio websocket? para crear un chat en tiempo real (YouTube)")
- [Build A Realtime Chat App In ReactJS and NodeJS | Socket.io Tutorial (YouTube)](https://www.youtube.com/watch?v=NU-HfZY3ATQ "Build A Realtime Chat App In ReactJS and NodeJS | Socket.io Tutorial (YouTube)")
