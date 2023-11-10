all:
	@cd ./srcs/ && docker-compose up --build -d

rebuild: stop all

resume:
	@echo "STARTING CONTAINERS...\n"
	@cd ./srcs/ && docker-compose up -d

stop:
	@cd ./srcs/ && docker-compose down
	@echo "CONTAINERS STOPPED!\n"

clean: stop
	docker-compose -f ./srcs/docker-compose.yml --env-file srcs/.env down -v --rmi all
	@echo "System cleaned!"

fclean: clean
	docker system prune -af
	@echo "System pruned!"

front:
	@echo "STARTING FRONT...\n"
	@cd ./srcs/front && npm start

back:
	@echo "STARTING BACK...\n"
	@cd ./srcs/front && npm run start:prod

database:
	@cd ./srcs/back && npm run db:dev:restart
	@echo "Database created succesfully..."

migrate:
	@cd ./srcs/back && npx prisma migrate dev

re: fclean all

.PHONY: all resume stop clean fclean front back database migrate re