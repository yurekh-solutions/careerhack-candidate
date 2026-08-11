$body = @{name='TestUser2026'; email='test2026check@example.com'; password='TestPass123!'} | ConvertTo-Json
try {
    $resp = Invoke-WebRequest -Uri 'https://careerhack-candidate.onrender.com/api/auth/register' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing -TimeoutSec 30
    Write-Host "REGISTER STATUS: $($resp.StatusCode)"
    Write-Host "REGISTER BODY: $($resp.Content)"
} catch {
    Write-Host "REGISTER ERROR: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) { Write-Host "ERROR BODY: $($_.ErrorDetails.Message)" }
}

# Test login
$loginBody = @{email='test2026check@example.com'; password='TestPass123!'} | ConvertTo-Json
try {
    $resp2 = Invoke-WebRequest -Uri 'https://careerhack-candidate.onrender.com/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody -UseBasicParsing -TimeoutSec 30
    Write-Host "LOGIN STATUS: $($resp2.StatusCode)"
    Write-Host "LOGIN BODY: $($resp2.Content)"
} catch {
    Write-Host "LOGIN ERROR: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) { Write-Host "ERROR BODY: $($_.ErrorDetails.Message)" }
}
