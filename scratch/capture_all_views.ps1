$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$artifactDir = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1"

# 1. Lobby View
$proc1 = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1400,900", "--screenshot=$artifactDir\lobby_view.png", "http://localhost:8085/" -PassThru
$proc1.WaitForExit()

# 2. In-Game View (showing subdivided Turkey & Top Command bar with Exit button)
$proc2 = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1400,900", "--screenshot=$artifactDir\game_view.png", "http://localhost:8085/?autostart=singleplayer&faction=turkey&skipbriefing=1" -PassThru
$proc2.WaitForExit()

Write-Host "Captured Lobby and Game Views successfully."
