@echo off
@REM ���ο� ������ ������ ���� ��ġ �����Դϴ�.


@REM 1. package.json�� ������ Ȯ���մϴ�.
@REM 2. ������ �Է� �޽��ϴ�.
@REM 3. ����� ������ Ŀ���մϴ�.
@REM 4. ����� ������ �±��մϴ�.
@REM 5. Ŀ�Ե� ������ Ǫ���մϴ�.
@REM 6. 'release/����'���� ���ο� �귱ġ�� �����մϴ�
@REM 7. ���ο� �귱ġ�� Ǫ���մϴ�.


FOR /F "tokens=1-4 delims=- " %%i IN ('date /t') DO SET yyyymmdd=%%i%%j%%k

@REM ���� �귱ġ ������ �����ɴϴ�.
(for /f "tokens=* USEBACKQ" %%a in (`git branch --show-current`) do set branch=%%a)

echo ���� �ֱ� �ݿ��� ������ �����ɴϴ�.
git checkout master
git pull

@REM ���� ��Ű�� ������ Ȯ���մϴ�.
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)

(for /F "tokens=1,2,3 delims=." %%a in ("%version%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
))

echo ======================
echo ���� ������Ʈ ���� - %version%
echo 1. Major ���� ������Ʈ [%major%] (�ֿ� ������Ʈ)
echo 2. Minor ���� ������Ʈ [%minor%] (��� ������Ʈ)
echo 3. Patch ���� ������Ʈ [%patch%] (���� ����)
echo 0. ���� ������Ʈ ���
echo ======================

set /p idx=���� ������Ʈ ������ �Է��ϼ���:

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
    echo ���� ������Ʈ�� ����մϴ�. - �귱ġ �ѹ�
    @REM �ѹ��� ����ġ
    git checkout %branch%
    exit /b
)

echo ��Ű���� ������ �����ϴ���....
@REM �׳� �����ϸ� ���μ����� �����
call npm pkg set version=%major%.%minor%.%patch%

echo %yyyymmdd%] CreateVersion - %version%  >> release.log


echo ��Ű�� ���� ���� �Ϸ�
(for /f "tokens=* USEBACKQ" %%a in (`node -p "require('./package').version"`) do set version=%%a)
echo ������Ʈ ����: %version%

timeout 2 > NUL

echo ���� ��������� Ŀ���մϴ�.
@REM ��������� Ŀ���ϰ� �����ؾ���.
git push 

echo ������ ���� ȯ���� �����մϴ�.
git branch release/%version%
git checkout release/%version%
echo ������ ���� ȯ���� ���� �Ϸ�

timeout 2 > NUL

echo ������ ���� ȯ���� Ŀ���մϴ�.
git add package.json
git add release.log
git commit -m "release: %version%"

echo ���� �ױ׸� �����մϴ�.
git tag release-%version%

git push origin release/%version%
echo ������ ���� ȯ���� Ǫ�� �Ϸ�

timeout 2 > NUL

echo ���� �귱ġ�� �����մϴ�.
git checkout %branch%


echo ������ ������ �����մϴ�.
git merge release/%version%





