#!/bin/bash

# 새로운 릴리즈 제작을 위한 배치 파일입니다.

# 현재 브런치 정보를 가져옵니다.
featBranch=$(git branch --show-current)

# 현재 브런치 정보 확인
if [[ ! $featBranch == "feat/"* ]]; then
    echo "현재 브런치가 feat/* 브런치가 아닙니다."
    echo "브런치를 feat/* 브런치로 변경 후 다시 시도해주세요."
    exit 1
fi

# 개발 브런치로 체크아웃 -=========================================== DEV
echo "개발 브런치로 체크아웃합니다."
git checkout develop
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
echo "1. Major 버전 업데이트 [$major] (주요 업데이트)"
echo "2. Minor 버전 업데이트 [$minor] (기능 업데이트)"
echo "3. Patch 버전 업데이트 [$patch] (버그 수정)"
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

echo "패키지 버전 수정 완료"
version=$(node -p "require('./package').version")

git log develop..$featBranch --branches --decorate --graph --oneline >> release.log
echo "$(date +%Y%m%d)] CreateVersion - $version"  >> release.log
echo "업데이트 버전: $version"

echo "배포를 위한 환경을 커밋합니다."
git add package.json
git add release.log

# =============================================================================================


if [[ $idx == 1 ]]; then
    # 주요 업데이트
    git checkout -b release/$version
    git commit -m "[Major] $version - 주요 업데이트"
elif [[ $idx == 2 ]]; then
    # 기능업데이트
    git checkout -b release/$version
    git commit -m "[Minor] $version - 기능 업데이트"
elif [[ $idx == 3 ]]; then
    # hotFix
    git checkout develop
    git merge $featBranch
    git commit -m "[Patch] $version - 버그 수정"
    git push origin develop

    echo "병합 요청 PR 페이지를 엽니다."
    open -a "Google Chrome" https://github.com/patrickmonster/orefinger-event-ts/compare/master...develop

    exit 0
fi

git merge $featBranch

echo "배포를 위한 환경을 푸시 완료"
git push
git push --set-upstream origin release/$version

if [[ $idx == 1 ]]; then
    git tag release-$version
fi
# =============================================================================================

echo "개발 브런치로 체크아웃합니다."
git checkout develop

echo "최신버전을 develop 브런치에 반영합니다."
git merge release/$version
git push

echo "브런치를 원래 브런치로 변경합니다."
git checkout $featBranch
