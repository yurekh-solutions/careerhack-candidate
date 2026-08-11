@echo off
cd /d c:\Users\yurek\OneDrive\Desktop\hr\careerhack-candidate\frontend
call npm run build 2>&1
cd /d c:\Users\yurek\OneDrive\Desktop\hr\careerhack-candidate
git add -f frontend/out/
git add frontend/app/
git commit -m "Replace lightning icon with professional rocket icon"
git push origin main
