@echo off
rem Retire le raccourci du dossier Demarrage de Windows. Le bot deja lance
rem continue de tourner : ferme sa fenetre pour l arreter.
set "LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ClaudeCord.lnk"
if exist "%LNK%" (
  del "%LNK%"
  echo Lancement automatique DESACTIVE.
) else (
  echo Le lancement automatique n'etait pas active.
)
pause
