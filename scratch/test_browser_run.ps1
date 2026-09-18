$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$port = 51950

$scenarios = @(
    @{
        Url = "http://localhost:$port/?autostart=singleplayer&faction=germany&skipbriefing=1"
        File = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1\geojson_gameplay_germany.png"
        Name = "Germany Tactical Focus"
    },
    @{
        Url = "http://localhost:$port/?autostart=singleplayer&faction=turkey&skipbriefing=1"
        File = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1\geojson_gameplay_turkey.png"
        Name = "Turkey Straits Tactical Focus"
    },
    @{
        Url = "http://localhost:$port/?autostart=singleplayer&faction=germany&skipbriefing=1&overview=1"
        File = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1\geojson_gameplay_overview.png"
        Name = "Continental Overview"
    }
)

foreach ($s in $scenarios) {
    Write-Host "Capturing $($s.Name)..."
    Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=1920,1080", "--screenshot=$($s.File)", "$($s.Url)" -Wait
    Write-Host "$($s.Name) generated: $(Test-Path $($s.File))"
}
