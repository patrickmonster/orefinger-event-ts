@echo off
chcp 65001

setlocal enabledelayedexpansion

REM 현재 브런치 정보를 가져옵니다.
for /f "tokens=*" %%a in ('git branch --show-current') do set "featBranch=%%a"

REM 현재 브런치 정보 확인
@REM if not "!featBranch:feat/=!" == "!featBranch!" (
@REM     echo "현재 브런치가 feat/* 브런치가 아닙니다."
@REM     echo "브런치를 feat/* 브런치로 변경 후 다시 시도해주세요."
@REM     exit /b 1
@REM )

REM 현재 커밋 적용
echo "현재 브런치를 커밋합니다."
git push

echo "마스터 브런치로 체크아웃합니다."
git checkout master
git pull

REM 현재 패키지 버전을 확인합니다.
set /p version=<./package.json
for /f "tokens=1-3 delims=." %%a in ("!version!") do (
    set "major=%%a"
    set "minor=%%b"
    set "patch=%%c"
)

echo "======================"
echo "버전 업데이트 설정 - !version!"
echo "1. Major 버전 업데이트 [!major!] ( - )"
echo "2. Minor 버전 업데이트 [!minor!] (주요 업데이트)"
echo "3. Patch 버전 업데이트 [!patch!] (핫 픽스)"
echo "0. 버전 업데이트 취소"
echo "======================"

set /p idx="버전 업데이트 설정을 입력하세요: "

if !idx! equ 1 (
    set /a major+=1
    set "minor=0"
    set "patch=0"
) else if !idx! equ 2 (
    set /a minor+=1
    set "patch=0"
) else if !idx! equ 3 (
    set /a patch+=1
) else (
    echo "버전 업데이트를 취소합니다. - 브런치 롤백"
    git checkout !featBranch!
    exit /b 0
)

set "newVersion=!major!.!minor!.!patch!"
REM 버전이 변경된 경우

echo "배포를 위한 환경을 제작합니다. - !newVersion!"
REM 마스터에서 배포 브런치를 생성합니다.
git branch "release/!newVersion!"
REM 배포 브런치로 체크아웃합니다.
git checkout "release/!newVersion!"

REM 패키지 버전을 변경합니다.
npm pkg set version="!newVersion!"

git add package.json
git commit -m "release: !newVersion!"

git push --set-upstream origin "release/!newVersion!"

REM 
start https://github.com/patrickmonster/orefinger-event-ts/compare/master...release/!newVersion!

set /p input="현재 브런치를 병합 하시겠습니까? 승인(엔터)/종료(다른키)"

if not "%input%" == "" (
    echo "브런치를 병합합니다."
    if not "!featBranch:feat/=!" == "!featBranch!" (
        echo "현재 브런치가 feat/* 브런치가 아닙니다."
        echo "브런치를 feat/* 브런치만 병합이 가능합니다."
        git checkout !featBranch!
        exit /b 1
    )
    REM git checkout !featBranch!
    git merge !featBranch!
    git push
)

REM git tag "release-!newVersion!"
REM git push origin "release/!newVersion!"

echo "브런치를 원래 브런치로 변경합니다."
git checkout !featBranch!
