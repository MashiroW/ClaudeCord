@echo off
title Pont Discord - Claude Code
cd /d "%~dp0"
:loop
node bridge.mjs
echo Le pont s'est arrete. Redemarrage dans 5 s (ferme la fenetre pour arreter)...
timeout /t 5 /nobreak >nul
goto loop
