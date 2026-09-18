$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artifactDir = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1"

# 1. Capture Lobby
$proc1 = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1400,900", "--screenshot=$artifactDir\lobby_view.png", "http://localhost:8085/" -PassThru
$proc1.WaitForExit()

# 2. Capture In-Game
$proc2 = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1400,900", "--screenshot=$artifactDir\game_view.png", "http://localhost:8085/?autostart=singleplayer&faction=turkey&skipbriefing=1" -PassThru
$proc2.WaitForExit()

Write-Host "LOBBY SHOT: $(Test-Path "$artifactDir\lobby_view.png")"
Write-Host "GAME SHOT: $(Test-Path "$artifactDir\game_view.png")"
