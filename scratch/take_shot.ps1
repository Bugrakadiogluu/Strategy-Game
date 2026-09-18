$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "file:///c:/Users/bugra.kadioglu/Desktop/BELGELER/Game/scratch/test_europe.svg"
$target = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1\test_europe_preview.png"
Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--window-size=2400,1600", "--screenshot=$target", "$url" -Wait
Write-Host "Exists: $(Test-Path $target)"
