@echo off
@REM 새로운 릴리즈 제작을 위한 배치 파일입니다.


@REM 1. package.json의 버전을 확인합니다.
@REM 2. 버전을 입력 받습니다.
@REM 3. 변경된 버전을 커밋합니다.
@REM 4. 변경된 버전을 태그합니다.
@REM 5. 커밋된 버전을 푸시합니다.
@REM 6. 'release/버전'으로 새로운 브런치를 생성합니다
@REM 7. 새로운 브런치를 푸시합니다.


FOR /F "tokens=1-4 delims=- " %%i IN ('date /t') DO SET yyyymmdd=%%i%%j%%k

@REM 현재 브런치 정보를 가져옵니다.
(for /f "tokens=* USEBACKQ" %%a in (`git branch --show-current`) do set branch=%%a)

echo 가장 최근 반영된 버전을 가져옵니다.
git checkout master
git pull

@REM 현재 패키지 버전을 확인합니다.
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)

(for /F "tokens=1,2,3 delims=." %%a in ("%version%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
))

echo ======================
echo 버전 업데이트 설정 - %version%
echo 1. Major 버전 업데이트 [%major%] (주요 업데이트)
echo 2. Minor 버전 업데이트 [%minor%] (기능 업데이트)
echo 3. Patch 버전 업데이트 [%patch%] (버그 수정)
echo 0. 버전 업데이트 취소
echo ======================

set /p idx=버전 업데이트 설정을 입력하세요:

if %idx%==1 (
    set /a major+=1
    set minor=0
    set patch=0
) else if %idx%==2 (
    set /a minor+=1
    set patch=0
) else if %idx%==3 (
    set /a patch+=1
) else (
    echo 버전 업데이트를 취소합니다. - 브런치 롤백
    @REM 롤백후 원위치
    git checkout %branch%
    exit /b
)

echo 패키지의 버전을 수정하는중....
@REM 그냥 실행하면 프로세서가 종료됨
call npm pkg set version=%major%.%minor%.%patch%

echo %yyyymmdd%] CreateVersion - %version%  >> release.log


echo 패키지 버전 수정 완료
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)
echo 업데이트 버전: %version%

timeout 2 > NUL

echo 현재 변경사항을 커밋합니다.
@REM 변경사항을 커밋하고 진행해야함.
git push 

echo 배포를 위한 환경을 제작합니다.
git branch release/%version%
git checkout release/%version%
echo 배포를 위한 환경을 제작 완료

timeout 2 > NUL

echo 배포를 위한 환경을 커밋합니다.
git add package.json
git add release.log
git commit -m "release: %version%"

echo 배포 테그를 생성합니다.
git tag release-%version%

git push origin release/%version%
echo 배포를 위한 환경을 푸시 완료

timeout 2 > NUL

echo 원래 브런치로 복귀합니다.
git checkout %branch%


echo 릴리즈 버전을 머지합니다.
git merge release/%version%





