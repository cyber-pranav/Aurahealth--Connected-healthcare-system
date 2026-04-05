@echo off
echo Preparing to upload your code to GitHub...
cd /d "%~dp0"
git push --force -u origin main
echo.
echo If you saw the login box and it finished successfully, you are 100% done!
echo You can now go to Render.com and build your app.
pause
