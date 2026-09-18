$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/?autostart=singleplayer&faction=turkey&skipbriefing=1"
$artifactDir = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1"
$targetShot = "$artifactDir\gameplay_verified.png"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9222", "--window-size=1600,1000", "$url" -PassThru
Start-Sleep -Seconds 3

$ws = New-Object System.Net.WebSockets.ClientWebSocket
$cts = New-Object System.Threading.CancellationTokenSource
$cts.CancelAfter(10000)

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $wsUrl = [Uri]$tabs[0].webSocketDebuggerUrl
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    # Enable Page & Runtime
    $enableCmd = '{"id":1,"method":"Runtime.enable"}'
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($enableCmd)
    $null = $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    Start-Sleep -Milliseconds 500

    # Evaluate JS: Check turkey provinces, difficulty, alliance status
    $evalCmd = '{"id":2,"method":"Runtime.evaluate","params":{"expression":"JSON.stringify({regionsCount: Object.keys(window.gameApp.gameState.regions).length, turkeyProvinces: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === \"turkey\").map(r => r.id), germanyProvinces: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === \"germany\").map(r => r.id).length, difficulty: window.gameApp.gameState.aiDifficulty, turkeyCapital: window.gameApp.gameState.factions.turkey.capitalRegionId, relationsToGermany: window.gameApp.gameState.getRelation(\"turkey\",\"germany\"), isTurkeyAlliedGermany: window.gameApp.gameState.isAllied(\"turkey\",\"germany\")})" }}'
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($evalCmd)
    $null = $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    # Listen until we get id:2
    $evalResult = $null
    for ($i = 0; $i -lt 15; $i++) {
        $buf = New-Object byte[] 65536
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
        if ($msg -match '"id":2') {
            $evalResult = $msg
            break
        }
    }
    Write-Host "EVAL RESULT: $evalResult"

    # Take screenshot
    $shotCmd = '{"id":3,"method":"Page.captureScreenshot"}'
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($shotCmd)
    $null = $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    # Accumulate chunks for large screenshot
    $ms = New-Object System.IO.MemoryStream
    for ($i = 0; $i -lt 50; $i++) {
        $buf = New-Object byte[] 65536
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $ms.Write($buf, 0, $res.Result.Count)
        if ($res.Result.EndOfMessage) {
            break
        }
    }
    $fullShotStr = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
    if ($fullShotStr -match '"data":"([^"]+)"') {
        $b64 = $matches[1]
        $imgBytes = [System.Convert]::FromBase64String($b64)
        [System.IO.File]::WriteAllBytes($targetShot, $imgBytes)
        Write-Host "SUCCESS: Screenshot written to $targetShot (Size: $($imgBytes.Length) bytes)"
    } else {
        Write-Host "Screenshot data not matched. Length: $($fullShotStr.Length)"
    }
} catch {
    Write-Host "Error: $_"
} finally {
    $ws.Dispose()
    Stop-Process -Id $proc.Id -Force
}
