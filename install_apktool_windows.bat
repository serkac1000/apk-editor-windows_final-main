
@echo off
echo APKTool Installer for Windows
echo =============================
echo.

echo Creating tools directory...
mkdir tools 2>nul

echo.
echo Checking for Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java not found!
    echo Please install Java JDK 8 or later from:
    echo https://www.oracle.com/java/technologies/downloads/
    echo.
    echo Alternative: Install OpenJDK from:
    echo https://adoptium.net/
    echo.
    pause
    exit /b 1
)

echo Java found!
java -version
echo.

echo Downloading APKTool...
echo.

echo Downloading apktool.bat...
powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/windows/apktool.bat' -OutFile 'tools\apktool.bat' -UseBasicParsing } catch { Write-Host 'Failed to download apktool.bat: ' $_.Exception.Message; exit 1 }"

if %errorlevel% neq 0 (
    echo Failed to download apktool.bat
    pause
    exit /b 1
)

echo Downloading apktool.jar...
powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.9.3.jar' -OutFile 'tools\apktool.jar' -UseBasicParsing } catch { Write-Host 'Failed to download apktool.jar: ' $_.Exception.Message; exit 1 }"

if %errorlevel% neq 0 (
    echo Failed to download apktool.jar
    pause
    exit /b 1
)

echo.
echo Adding tools to PATH...
set PATH=%CD%\tools;%PATH%

echo.
echo Verifying installation...
if exist "tools\apktool.jar" (
    if exist "tools\apktool.bat" (
        echo SUCCESS: APKTool installed successfully!
        echo Location: %CD%\tools\
        echo.
        echo Testing APKTool...
        tools\apktool.bat --version
        echo.
        echo Installation complete! You can now use the full APK editing features.
        echo.
        echo To test the functionality, run:
        echo python test_apk_functionality.py
    ) else (
        echo ERROR: apktool.bat not found
    )
) else (
    echo ERROR: apktool.jar not found
)

echo.
pause
