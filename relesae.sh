#!/bin/bash

# 현재 브런치 정보를 가져옵니다.
featBranch=$(git branch --show-current)

# 현재 브런치 정보 확인
if [[ ! $featBranch == feat/* ]]; then
    echo "현재 브런치가 feat/* 브런치가 아닙니다."
    echo "브런치를 feat/* 브런치로 변경 후 다시 시도해주세요."
    exit 1
fi

# 현재 커밋 적용
echo "현재 브런치를 커밋합니다."
git push

# 개발 브런치로 체크아웃
echo "개발 브런치로 체크아웃합니다."
git checkout develop
git pull

# 현재 패키지 버전을 확인합니다.
version=$(node -p "require('./package').version")
IFS='.' read -ra VERSION_PARTS <<< "$version"
major="${VERSION_PARTS[0]}"
minor="${VERSION_PARTS[1]}"
patch="${VERSION_PARTS[2]}"

echo "======================"
echo "버전 업데이트 설정 - $version"
echo "1. Major 버전 업데이트 [$major] (주요 업데이트)"
echo "2. Minor 버전 업데이트 [$minor] (기능 업데이트)"
echo "3. Patch 버전 업데이트 [$patch] (버그 수정)"
echo "0. 버전 업데이트 취소"
echo "======================"

read -p "버전 업데이트 설정을 입력하세요: " idx

case $idx in
1)
    ((major++))
    minor=0
    patch=0
    ;;
2)
    ((minor++))
    patch=0
    ;;
3)
    ((patch++))
    ;;
*)
    echo "버전 업데이트를 취소합니다. - 브런치 롤백"
    git checkout $featBranch
    exit 0
    ;;
esac

newVersion="$major.$minor.$patch"

echo "배포를 위한 환경을 제작합니다."
git branch "release/$newVersion"
git checkout "release/$newVersion"

npm pkg set version="$newVersion"

echo "$(date '+%Y%m%d')] CreateVersion - $newVersion" >> release.log

git add package.json release.log
git commit -m "release: $newVersion"

git tag "release-$newVersion"
git push origin "release/$newVersion"

echo "개발 브런치로 체크아웃합니다."
git checkout develop
git merge "release/$newVersion"
git push

echo "브런치를 원래 브런치로 변경합니다."
git checkout $featBranch

open "https://github.com/patrickmonster/orefinger-event-ts/compare/master...release/$newVersion"