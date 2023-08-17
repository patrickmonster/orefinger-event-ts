@echo off
@REM USE EUC-KR

@REM 새로운 릴리즈 제작을 위한 배치 파일입니다.

@REM 1. 현재 브런치가 feat/* 인지 확인합니다.
@REM 2. 현재 브런치를 develop로 변경합니다.
@REM 3. feat/* 브런치를 develop 브런치로 머지합니다.
@REM 4. package.json의 버전을 확인합니다.
@REM 5. 버전을 입력 받습니다.
@REM 6. release/* 브런치를 생성합니다.
@REM 7. release/* 브런치로 checkout합니다.
@REM 8. 변경된 버전을 적용합니다.
@REM 9. 변경된 버전을 커밋합니다.
@REM 10. 변경된 버전을 태그합니다.
@REM 11. 커밋된 버전을 푸시합니다.
@REM 12. develop 브런치로 checkout합니다.
@REM 13. release/* 브런치를 develop 브런치로 머지합니다.
@REM 14. develop 브런치를 push 합니다.D
@REM 15. 원래 브런치로 checkout합니다.

FOR /F "tokens=1-4 delims=- " %%i IN ('date /t') DO SET yyyymmdd=%%i%%j%%k

@REM 현재 브런치 정보를 가져옵니다.
(for /f "tokens=* USEBACKQ" %%a in (`git branch --show-current`) do set featBranch=%%a)

@REM 현재 브런치 정보 확인
IF NOT %featBranch:~0,5%==feat/ (
    echo 현재 브런치가 feat/* 브런치가 아닙니다.
    echo 브런치를 feat/* 브런치로 변경 후 다시 시도해주세요.
    exit /b
)

@REM 현재 커밋 적용
echo 현재 브런치를 커밋합니다.
git push

@REM 개발 브런치로 체크아웃
echo 개발 브런치로 체크아웃합니다.
git checkout develop
git pull

@REM =============================================================================================

@REM 현재 패키지 버전을 확인합니다.
echo 최신 반영 버전 정보를 확인합니다.
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)

(for /F "tokens=1,2,3 delims=." %%a in ("%version%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
))

@REM =============================================================================================

echo ======================
echo 버전 업데이트 설정 - %version%
echo 1. Major 버전 업데이트 [%major%] (주요 업데이트)
echo 2. Minor 버전 업데이트 [%minor%] (기능 업데이트)
echo 3. Patch 버전 업데이트 [%patch%] (버그 수정)
echo 0. 버전 업데이트 취소
echo ======================

set /p idx=버전 업데이트 설정을 입력하세요:

if %idx%==1 (
    @REM 주요 업데이트
    set /a major+=1
    set minor=0
    set patch=0
) else if %idx%==2 (
    @REM 기능업데이트
    set /a minor+=1
    set patch=0
) else if %idx%==3 (
    @REM hotFix
    set /a patch+=1
) else (
    echo 버전 업데이트를 취소합니다. - 브런치 롤백
    @REM 롤백후 원위치
    git checkout %featBranch%
    exit /b
)

@REM =============================================================================================

echo 배포를 위한 환경을 제작합니다.
git branch release/%version%
git checkout release/%version%
echo 배포를 위한 환경을 제작 완료

echo 패키지의 버전을 수정하는중....
@REM 그냥 실행하면 프로세서가 종료됨
call npm pkg set version=%major%.%minor%.%patch%

echo %yyyymmdd%] CreateVersion - %version%  >> release.log


echo 패키지 버전 수정 완료
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)
echo 업데이트 버전: %version%

@REM =============================================================================================

echo 배포를 위한 환경을 커밋합니다.
git add package.json
git add release.log
git commit -m "release: %version%"

echo 배포 테그를 생성합니다.
git tag release-%version%

git push origin release/%version%
echo 배포를 위한 환경을 푸시 완료


echo 개발 브런치로 체크아웃합니다.
git checkout develop

echo 최신버전을 develop 브런치에 반영합니다.
git merge release/%version%
git push

echo 브런치를 원래 브런치로 변경합니다.
git checkout %featBranch%
