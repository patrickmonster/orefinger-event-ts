@echo off
@REM USE EUC-KR

@REM ���ο� ������ ������ ���� ��ġ �����Դϴ�.

@REM 1. ���� �귱ġ�� feat/* ���� Ȯ���մϴ�.
@REM 2. ���� �귱ġ�� develop�� �����մϴ�.
@REM 3. feat/* �귱ġ�� develop �귱ġ�� �����մϴ�.
@REM 4. package.json�� ������ Ȯ���մϴ�.
@REM 5. ������ �Է� �޽��ϴ�.
@REM 6. release/* �귱ġ�� �����մϴ�.
@REM 7. release/* �귱ġ�� checkout�մϴ�.
@REM 8. ����� ������ �����մϴ�.
@REM 9. ����� ������ Ŀ���մϴ�.
@REM 10. ����� ������ �±��մϴ�.
@REM 11. Ŀ�Ե� ������ Ǫ���մϴ�.
@REM 12. develop �귱ġ�� checkout�մϴ�.
@REM 13. release/* �귱ġ�� develop �귱ġ�� �����մϴ�.
@REM 14. develop �귱ġ�� push �մϴ�.D
@REM 15. ���� �귱ġ�� checkout�մϴ�.

FOR /F "tokens=1-4 delims=- " %%i IN ('date /t') DO SET yyyymmdd=%%i%%j%%k

@REM ���� �귱ġ ������ �����ɴϴ�.
(for /f "tokens=* USEBACKQ" %%a in (`git branch --show-current`) do set featBranch=%%a)

@REM ���� �귱ġ ���� Ȯ��
IF NOT %featBranch:~0,5%==feat/ (
    echo ���� �귱ġ�� feat/* �귱ġ�� �ƴմϴ�.
    echo �귱ġ�� feat/* �귱ġ�� ���� �� �ٽ� �õ����ּ���.
    exit /b
)

@REM ���� Ŀ�� ����
echo ���� �귱ġ�� Ŀ���մϴ�.
git push

@REM ���� �귱ġ�� üũ�ƿ�
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

@REM =============================================================================================

echo ������ ���� ȯ���� �����մϴ�.
git branch release/%version%
git checkout release/%version%
echo ������ ���� ȯ���� ���� �Ϸ�

echo ��Ű���� ������ �����ϴ���....
@REM �׳� �����ϸ� ���μ����� �����
call npm pkg set version=%major%.%minor%.%patch%

echo %yyyymmdd%] CreateVersion - %version%  >> release.log


echo ��Ű�� ���� ���� �Ϸ�
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)
echo ������Ʈ ����: %version%

@REM =============================================================================================

echo ������ ���� ȯ���� Ŀ���մϴ�.
git add package.json
git add release.log
git commit -m "release: %version%"

echo ���� �ױ׸� �����մϴ�.
git tag release-%version%

git push origin release/%version%
echo ������ ���� ȯ���� Ǫ�� �Ϸ�


echo ���� �귱ġ�� üũ�ƿ��մϴ�.
git checkout develop

echo �ֽŹ����� develop �귱ġ�� �ݿ��մϴ�.
git merge release/%version%
git push

echo �귱ġ�� ���� �귱ġ�� �����մϴ�.
git checkout %featBranch%
