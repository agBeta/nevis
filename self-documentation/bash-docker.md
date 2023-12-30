## Kill

You may to want to kill all processes based on some keyword. Run the following. But **don't** use something like "nodejs" as keyword, since it will disrupt your Skype, Slack, VSCode and any program which has fired up nodejs process.  
&emsp;  `ps aux | grep "<keyword>" | tr -s ' ' | cut -d ' ' -f 2 | xargs kill -SIGKILL`

## really clear terminal
run `tput reset`.

## Docker
https://dev.to/gustavocontreiras/how-to-create-a-dockerized-full-stack-environment-with-mysql-nestjs-and-nextjs-27oh.


## pm2 and docker
Good
https://dev.to/mandraketech/pm2-and-docker-in-the-world-of-nodejs-1lg8.


## Tutorial
Sanjeev Thiyagarajan: Docker + Node.js⧸express tutorial： Building dev⧸prod workflow with docker and Node.js.

docker build .
docker image ls
docker image rm >IMAGE_ID<

docker build -t node-app-image .
docker run -d --name node-app-container-1 node-app-image
docker ps
docker rm node-app-container-1 -f    ||----> -f flag: first stops the container and then deletes it.

docker run -p 3000:3000 -d --name node-app node-app-image     || --> right number is port inside container

*********************
docker exec -it node-app bash
ls
exit
*************************


docker run -v path_Local_Machine:path_Inside_Container -p 3000:3000 -d --name node-app node-app-image    ||---> . does not work here in path

docker run -v $(pwd):/app -p 3000:3000 -d --name node-app node-app-image


---> After deleting node_modules from local [45:00]
docker ps -a
docker logs node-app

docker run -v $(pwd):/app -v /app/node_modules -p 3000:3000 -d --name node-app node-app-image

                          
docker run -v $(pwd):/app:ro -v /app/node_modules -p 3000:3000 -d --name node-app node-app-image
                        ^^^^^^


docker run -v $(pwd):/app:ro -v /app/node_modules --env PORT=4000 -p 3000:4000 -d --name node-app node-app-image
                                                    ^^^^^^^^^^^^^^        ^^^^
Note: For another env variable you have to specify --env again for each one.

printenv     ||--> prints env variable currently set in bash


docker run -v $(pwd):/app:ro -v /app/node_modules --env-file ./.env -p 3000:4000 -d --name node-app node-app-image

docker volume ls

docker volume rm >VOLUME_NAME<
    OR
docker volume prune


docker-compose up -d
docker-compose down   ||---> -v flag: If you want to also remove volumes.

docker-compose up -d --build

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d


---> remember npm ci vs npm install