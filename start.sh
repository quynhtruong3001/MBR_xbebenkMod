@echo off
title MyBotRun Auto Restart
color a

:MyBot

echo Starting MyBotRun

start "" "C:\Users\khoan\Desktop\MBR_xbebenkMod\MyBot2.run.au3" -a -ha -restart /HideAndroid /MiniGUI /Autostart /NoBotSlot /NoWatchDog TIMEOUT /T 60 /nobreak