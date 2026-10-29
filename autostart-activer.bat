@echo off
rem Ajoute un raccourci vers start.bat dans le dossier Demarrage de Windows :
rem le bot se lancera tout seul (fenetre reduite) a chaque ouverture de session.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s = (New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup') + '\ClaudeCord.lnk');" ^
  "$s.TargetPath = '%~dp0start.bat'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 7;" ^
  "$s.Description = 'Pont Discord - Claude Code'; $s.Save()"
if errorlevel 1 (
  echo Echec : le lancement automatique n'a pas pu etre active.
) else (
  echo Lancement automatique ACTIVE : le bot demarrera avec Windows.
)
pause
