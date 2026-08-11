@echo off
cd /d c:\Users\yurek\OneDrive\Desktop\hr\careerhack-candidate\frontend
call npm run build 2>&1
cd /d c:\Users\yurek\OneDrive\Desktop\hr\careerhack-candidate
git add -f frontend/out/
git add frontend/app/
git commit -m "Match reference design: graduation cap icon, AI badge, icons in inputs, feature list"
git push origin main
