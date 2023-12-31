#!/bin/bash

# 새로운 릴리즈 제작을 위한 배치 파일입니다.

# 현재 브런치 정보를 가져옵니다.
featBranch=$(git branch --show-current)

# 현재 브런치 정보 확인
# if [[ ! $featBranch == feat/* ]]; then
#     echo "현재 브런치가 feat/* 브런치가 아닙니다."
#     echo "브런치를 feat/* 브런치로 변경 후 다시 시도해주세요."
#     exit 1
# fi

# 현재 커밋 적용
echo "현재 브런치를 커밋합니다."
git push

echo "마스터 브런치로 체크아웃합니다."
git checkout master
git pull

# =============================================================================================

# 현재 패키지 버전을 확인합니다.
echo "최신 반영 버전 정보를 확인합니다."
version=$(node -p "require('./package').version")

major=$(echo $version | cut -d. -f1)
minor=$(echo $version | cut -d. -f2)
patch=$(echo $version | cut -d. -f3)

# =============================================================================================

echo "커밋 로그를 확인합니다."
git log develop..$featBranch --branches --decorate --graph --oneline

echo "======================="
echo "버전 업데이트 설정 - $version"
echo "1. Major 버전 업데이트 [$major] ( - )"
echo "2. Minor 버전 업데이트 [$minor] (주요 업데이트)"
echo "3. Patch 버전 업데이트 [$patch] (핫 픽스)"
echo "0. 버전 업데이트 취소"
echo "======================="

read -p "버전 업데이트 설정을 입력하세요: " idx

if [[ $idx == 1 ]]; then
    # 주요 업데이트
    major=$((major+1))
    minor=0
    patch=0
elif [[ $idx == 2 ]]; then
    # 기능업데이트
    minor=$((minor+1))
    patch=0
elif [[ $idx == 3 ]]; then
    # hotFix
    patch=$((patch+1))
else
    echo "버전 업데이트를 취소합니다. - 브런치 롤백"
    # 롤백후 원위치
    git checkout $featBranch
    exit 1
fi

version="$major.$minor.$patch"
# =============================================================================================

echo "패키지의 버전을 수정하는중...."
npm --no-git-tag-version version $version

newVersion="$major.$minor.$patch"
# 버전이 변경된 경우

echo "배포를 위한 환경을 제작합니다. - $newVersion"
# 마스터에서 배포 브런치를 생성합니다.
git branch "release/$newVersion"
# 배포 브런치로 체크아웃합니다.
git checkout "release/$newVersion"

# 패키지 버전을 변경합니다.
npm pkg set version="$newVersion"

git add package.json
git commit -m "release: $newVersion"

# 
open "https://github.com/patrickmonster/orefinger-event-ts/compare/master...release/$newVersion"


read -p "현재 브런치를 병합 하시겠습니까? 승인(엔터)/종료(다른키)" input

if [[ -z "$input" ]]; then

    if [[ ! $featBranch == feat/* ]]; then
        echo "현재 브런치가 feat/* 브런치가 아닙니다."
        echo "브런치를 feat/* 브런치인 경우에만, 버전 관리가 가능합니다."
        git checkout $featBranch
        exit 1
    fi
    
    echo "브런치를 병합합니다."
    # git checkout $featBranch
    git merge $featBranch
    git push
fi

# git tag "release-$newVersion"
# git push origin "release/$newVersion"

# echo "개발 브런치로 체크아웃합니다."
# git checkout develop
# git merge "release/$newVersion"
# git push

echo "브런치를 원래 브런치로 변경합니다."
git checkout $featBranch

