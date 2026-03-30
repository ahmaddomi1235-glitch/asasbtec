@echo off
echo Fixing permissions for asasbtec folder...
takeown /f "C:\Users\ahmad\Desktop\asasbtec" /r /d y
icacls "C:\Users\ahmad\Desktop\asasbtec" /grant "%USERNAME%:(OI)(CI)F" /T
echo Done! Now copy the project files from Documents\asasmehani to Desktop\asasbtec
pause
