@REM @echo off
@REM USE UTF-8

@REM ���ο� ������ ������ ���� ��ġ �����Դϴ�.

FOR /F "tokens=1-4 delims=- " %%i IN ('date /t') DO SET yyyymmdd=%%i%%j%%k

@REM ���� �귱ġ ������ �����ɴϴ�.
(for /f "tokens=* USEBACKQ" %%a in (`git branch --show-current`) do set featBranch=%%a)

@REM ���� �귱ġ ���� Ȯ��
IF NOT %featBranch:~0,5%==feat/ (
    echo ���� �귱ġ�� feat/* �귱ġ�� �ƴմϴ�.
    echo �귱ġ�� feat/* �귱ġ�� ���� �� �ٽ� �õ����ּ���.
    exit /b
)

@REM ���� �귱ġ�� üũ�ƿ� -=========================================== DEV
echo ���� �귱ġ�� üũ�ƿ��մϴ�.
git checkout develop
git pull

@REM =============================================================================================

@REM ���� ��Ű�� ������ Ȯ���մϴ�.
echo �ֽ� �ݿ� ���� ������ Ȯ���մϴ�.
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)

(for /F "tokens=1,2,3 delims=." %%a in ("%version%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
))

@REM =============================================================================================

echo Ŀ�� �α׸� Ȯ���մϴ�.
git log develop..%featBranch% --branches --decorate --graph --oneline

echo ======================
echo ���� ������Ʈ ���� - %version%
echo 1. Major ���� ������Ʈ [%major%] (�ֿ� ������Ʈ)
echo 2. Minor ���� ������Ʈ [%minor%] (��� ������Ʈ)
echo 3. Patch ���� ������Ʈ [%patch%] (���� ����)
echo 0. ���� ������Ʈ ���
echo ======================

set /p idx=���� ������Ʈ ������ �Է��ϼ���:

if %idx%==1 (
    @REM �ֿ� ������Ʈ
    set /a major+=1
    set minor=0
    set patch=0
) else if %idx%==2 (
    @REM ��ɾ�����Ʈ
    set /a minor+=1
    set patch=0
) else if %idx%==3 (
    @REM hotFix
    set /a patch+=1
) else (
    echo ���� ������Ʈ�� ����մϴ�. - �귱ġ �ѹ�
    @REM �ѹ��� ����ġ
    git checkout %featBranch%
    exit /b
)

set version=%major%.%minor%.%patch%
@REM =============================================================================================

echo ��Ű���� ������ �����ϴ���....
@REM �׳� �����ϸ� ���μ����� �����
call npm pkg set version=%major%.%minor%.%patch%

echo ��Ű�� ���� ���� �Ϸ�
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)

git log develop..%featBranch% --branches --decorate --graph --oneline >> release.log
echo %yyyymmdd%] CreateVersion - %version%  >> release.log
echo ������Ʈ ����: %version%

echo ������ ���� ȯ���� Ŀ���մϴ�.
git add package.json
git add release.log

@REM =============================================================================================

if %idx%==1 (
    @REM �ֿ� ������Ʈ
    git checkout -b release/%version%
    git commit -m "[Major] %version% - �ֿ� ������Ʈ"
) else if %idx%==2 (
    @REM ��ɾ�����Ʈ
    git checkout -b release/%version%
    git commit -m "[Minor] %version% - ��� ������Ʈ"
) else if %idx%==3 (
    @REM hotFix
    git commit -m "[Patch] %version% - ���� ����"
    git checkout develop
    git push origin develop

    echo ���� ��û PR �������� ���ϴ�.
    start chrome github.com/patrickmonster/orefinger-event-ts/compare/master...develop

    exit /b 0
)

echo ������ ���� ȯ���� Ǫ�� �Ϸ�
git push
git push --set-upstream origin release/%version%


if %idx%==1 (
    git tag release-%version%
) 
@REM =============================================================================================

echo ���� �귱ġ�� üũ�ƿ��մϴ�.
git checkout develop

echo �ֽŹ����� develop �귱ġ�� �ݿ��մϴ�.
git merge release/%version%
git push

echo �귱ġ�� ���� �귱ġ�� �����մϴ�.
git checkout %featBranch%
