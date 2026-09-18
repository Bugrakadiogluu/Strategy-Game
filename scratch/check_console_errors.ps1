$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$port = 51950
$url = "http://localhost:$port/?autostart=singleplayer&faction=germany&skipbriefing=1&select=de"

# Run chrome with remote debugging port 9222 and take logs
$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9222", "$url" -PassThru
Start-Sleep -Seconds 3

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $wsUrl = $tabs[0].webSocketDebuggerUrl
    Write-Host "Connected to tab: $($tabs[0].title), WS: $wsUrl"
} catch {
    Write-Host "Could not connect to CDP: $_"
}

Stop-Process -Id $proc.Id -Force
