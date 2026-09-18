$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$port = 51950
$url = "http://localhost:$port/?autostart=singleplayer&faction=germany&skipbriefing=1&overview=1"
$file = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1\geojson_gameplay_overview_full.png"

Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1920,1080", "--screenshot=$file", "$url" -Wait
Write-Host "Overview full generated: $(Test-Path $file)"
