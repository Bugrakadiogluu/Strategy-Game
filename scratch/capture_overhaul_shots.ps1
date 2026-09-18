$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/?autostart=singleplayer&faction=germany&skipbriefing=1"
$artifactDir = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9230", "--window-size=1600,1000", "$url" -PassThru
Start-Sleep -Seconds 4

function Send-CdpCommand($ws, $id, $method, $params = $null) {
    $obj = @{ id = $id; method = $method }
    if ($params) { $obj["params"] = $params }
    $json = $obj | ConvertTo-Json -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $cts = New-Object System.Threading.CancellationTokenSource(15000)
    $null = $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    $buf = New-Object byte[] 2097152
    while ($true) {
        $mem = New-Object System.IO.MemoryStream
        while ($true) {
            $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
            $res.Wait()
            $mem.Write($buf, 0, $res.Result.Count)
            if ($res.Result.EndOfMessage) { break }
        }
        $str = [System.Text.Encoding]::UTF8.GetString($mem.ToArray())
        if ($str -match """id"":\s*$id\b") {
            return $str
        }
    }
}

function Save-Screenshot($ws, $id, $filePath) {
    $res = Send-CdpCommand $ws $id "Page.captureScreenshot" @{ format = "png" }
    $parsed = $res | ConvertFrom-Json
    if ($parsed.result -and $parsed.result.data) {
        $bytes = [Convert]::FromBase64String($parsed.result.data)
        [System.IO.File]::WriteAllBytes($filePath, $bytes)
        Write-Host "Saved screenshot: $filePath"
    }
}

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9230/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*8085*" } | Select-Object -First 1
    $wsUrl = [Uri]$pageTab.webSocketDebuggerUrl

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(10000)
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    $null = Send-CdpCommand $ws 1 "Page.enable"
    $null = Send-CdpCommand $ws 2 "Runtime.enable"
    Start-Sleep -Seconds 1

    # 1. Close any modal and take Germany Map view
    $scriptGermany = "(() => {
        const app = window.gameApp;
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('visible'));
        app.renderer.focusOnFaction('germany');
        return 'focused-germany';
    })()"
    $null = Send-CdpCommand $ws 10 "Runtime.evaluate" @{ expression = $scriptGermany }
    Start-Sleep -Seconds 1
    Save-Screenshot $ws 11 "$artifactDir\germany_provinces_view.png"

    # 2. Switch to Combat Tab to show Morale Gauge
    $scriptCombat = "(() => {
        const app = window.gameApp;
        app.hud.switchTab('tab-combat');
        app.hud.setSelectedRegion('de_berlin', 'de_dresden');
        return 'combat-tab';
    })()"
    $null = Send-CdpCommand $ws 20 "Runtime.evaluate" @{ expression = $scriptCombat }
    Start-Sleep -Seconds 1
    Save-Screenshot $ws 21 "$artifactDir\combat_morale_view.png"

    # 3. Focus on USSR and take Eastern/Asian territories screenshot
    $scriptUssr = "(() => {
        const app = window.gameApp;
        app.renderer.focusOnFaction('ussr');
        return 'focused-ussr';
    })()"
    $null = Send-CdpCommand $ws 30 "Runtime.evaluate" @{ expression = $scriptUssr }
    Start-Sleep -Seconds 1
    Save-Screenshot $ws 31 "$artifactDir\ussr_provinces_view.png"

    Write-Host "Overhaul screenshots captured successfully."
} catch {
    Write-Host "Screenshot error: $_"
} finally {
    if ($ws) { $ws.Dispose() }
    Stop-Process -Id $proc.Id -Force
}
