@echo off
setlocal enabledelayedexpansion
set /p str=请输入要删除的字符（回车确认）：
set /p str1=请输入要替换的字符（回车确认）：
for /f "delims=" %%a in ('dir /a-d/b *') do (
set new=%%~a
ren "!new!" "!new:%str%=%str1%!")
echo 字符“%str%”已删除！&pause