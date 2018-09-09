#!/usr/bin/env bash


docker stop see-ui
docker rm see-ui
docker rmi -f see-ui-image
docker build --build-arg NODE_ENV=$1 -t see-ui-image -f scripts/Dockerfile .

docker run -e "NODE_ENV=$1" -d -p 8101:8080 -m 1G --name see-ui see-ui-image
