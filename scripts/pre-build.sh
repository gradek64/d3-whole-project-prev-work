#!/usr/bin/env bash
#chmod +x ./build.sh ./build.sh $1

#ROOT=$PWD
#cd $ROOT

npm install
NODE_ENV=$1 gulp build

# create docker container
bash ./scripts/build.sh $1



