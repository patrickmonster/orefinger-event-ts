#!/bin/bash
REPOSITORY=/home/ec2-user/build

cd $REPOSITORY

# # 모든 서비스 중단
# sudo /usr/bin/pm2 stop all || true