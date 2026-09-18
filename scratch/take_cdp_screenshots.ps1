$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/"
$artifactDir = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9226", "--window-size=1600,1000", "$url" -PassThru
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
    } else {
        Write-Host "Failed to capture screenshot: $res"
    }
}

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9226/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*8085*" } | Select-Object -First 1
    $wsUrl = [Uri]$pageTab.webSocketDebuggerUrl

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(10000)
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    $null = Send-CdpCommand $ws 1 "Page.enable"
    $null = Send-CdpCommand $ws 2 "Runtime.enable"
    Start-Sleep -Milliseconds 500

    # 1. Capture Lobby
    Save-Screenshot $ws 10 "$artifactDir\lobby_view.png"

    # 2. Select Turkey and trigger Briefing
    $scriptTurkey = "(() => {
        const trCard = document.querySelector('.faction-pill-card[data-faction=\'turkey\']');
        if (trCard) trCard.click();
        const startBtn = document.getElementById('btn-start-singleplayer-quick');
        if (startBtn) startBtn.click();
    })()"
    $null = Send-CdpCommand $ws 20 "Runtime.evaluate" @{ expression = $scriptTurkey }
    Start-Sleep -Seconds 1
    Save-Screenshot $ws 21 "$artifactDir\briefing_view.png"

    # 3. Enter Game
    $scriptEnter = "(() => {
        const enterBtn = document.getElementById('btn-briefing-start');
        if (enterBtn) enterBtn.click();
    })()"
    $null = Send-CdpCommand $ws 30 "Runtime.evaluate" @{ expression = $scriptEnter }
    Start-Sleep -Seconds 2
    Save-Screenshot $ws 31 "$artifactDir\game_view.png"

    # 4. Open Intel Tab to show Diplomacy
    $scriptIntel = "(() => {
        if (window.gameApp && window.gameApp.hud) {
            window.gameApp.hud.switchTab('tab-intel');
        }
        return 'intel-switched';
    })()"
    $evalRes = Send-CdpCommand $ws 40 "Runtime.evaluate" @{ expression = $scriptIntel }
    Start-Sleep -Seconds 1
    Save-Screenshot $ws 41 "$artifactDir\intel_diplomacy_view.png"

    Write-Host "All CDP screenshots captured successfully!"
} catch {
    Write-Host "Error in CDP screenshots: $_"
} finally {
    if ($ws) { $ws.Dispose() }
    Stop-Process -Id $proc.Id -Force
}
