#!/bin/bash
REPOSITORY=/home/ec2-user/build

cd $REPOSITORY


# 환경변수 셋팅
path=""
filename="dist/.env"

# if [ ${NODE_ENV} == "production" ] ; then
path="/orefinger/production/"
# else
    # path="/orefinger/development/"
# fi

# 기존 파일 삭제
rm $filename



# .env 파일 생성
echo BUCKET=$(aws ssm get-parameters --region ap-northeast-2 --names $path"BUCKET" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo DB_USER=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DB_USER" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo DB_HOST=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DB_HOST" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo DB_PASSWD=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DB_PASSWD" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo DB_DATABASE=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DB_DATABASE" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo REDIS_URL=$(aws ssm get-parameters --region ap-northeast-2 --names $path"REDIS_URL" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo DISCORD_CLIENT_ID=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DISCORD_CLIENT_ID" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo DISCORD_PUBLIC_KEY=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DISCORD_PUBLIC_KEY" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo DISCORD_TOKEN=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DISCORD_TOKEN" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo JWT_SECRET=$(aws ssm get-parameters --region ap-northeast-2 --names $path"JWT_SECRET" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo MASTER_KEY=$(aws ssm get-parameters --region ap-northeast-2 --names $path"MASTER_KEY" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo KAKAO_CLIENT=$(aws ssm get-parameters --region ap-northeast-2 --names $path"KAKAO_CLIENT" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo KAKAO_SECRET=$(aws ssm get-parameters --region ap-northeast-2 --names $path"KAKAO_SECRET" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo TOSS_CLIENT=$(aws ssm get-parameters --region ap-northeast-2 --names $path"TOSS_CLIENT" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo TOSS_SECRET=$(aws ssm get-parameters --region ap-northeast-2 --names $path"TOSS_SECRET" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo YOUTUBE_API_KEY=$(aws ssm get-parameters --region ap-northeast-2 --names $path"YOUTUBE_API_KEY" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo WEB_HOOK_URL=$(aws ssm get-parameters --region ap-northeast-2 --names $path"WEB_HOOK_URL" --query Parameters[0].Value | sed 's/"//g')  >> $filename

echo PORT=3000  >> $filename

# npm 설치
sudo /usr/bin/yarn

# 기존 서비스 중단
sudo /usr/bin/pm2 stop all || true

#  서비스 시작
sudo /usr/bin/pm2 start dist/app.js