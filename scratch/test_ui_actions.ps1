$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/?autostart=singleplayer&faction=turkey&skipbriefing=1"
$artifactDir = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1"
$targetShot = "$artifactDir\gameplay_verified.png"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9225", "--window-size=1600,1000", "$url" -PassThru
Start-Sleep -Seconds 4

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9225/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*8085*" } | Select-Object -First 1
    $wsUrl = [Uri]$pageTab.webSocketDebuggerUrl

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $cts.CancelAfter(8000)
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    # Enable Runtime & Page
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes('{"id":1,"method":"Runtime.enable"}'), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes('{"id":2,"method":"Page.enable"}'), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)
    Start-Sleep -Milliseconds 300

    # 1. Test Diplomacy Actions in GameState
    $expr = '(() => { ' +
            '  const app = window.gameApp; ' +
            '  const initialRel = app.gameState.getRelation("turkey", "germany"); ' +
            '  app.gameState.factions.turkey.industryPoints = 50; ' +
            '  const aidRes = app.gameState.sendDiplomaticAid("turkey", "germany", 10); ' +
            '  const newRel = app.gameState.getRelation("turkey", "germany"); ' +
            '  const pactRes = app.gameState.signNonAggressionPact("turkey", "germany", 5); ' +
            '  const hasPact = app.gameState.hasNonAggressionPact("turkey", "germany"); ' +
            '  return JSON.stringify({ aidRes, initialRel, newRel, pactRes, hasPact }); ' +
            '})()'

    $payload = '{"id":3,"method":"Runtime.evaluate","params":{"expression":' + ($expr | ConvertTo-Json) + '}}'
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes($payload), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    $buf = New-Object byte[] 65536
    for ($i = 0; $i -lt 15; $i++) {
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
        if ($msg -match '"id":3') {
            Write-Host "DIPLOMACY TEST: $msg"
            break
        }
    }

    # 2. Test Exit Game Confirmation and Reset
    $exitExpr = '(() => { ' +
                '  const app = window.gameApp; ' +
                '  document.getElementById("btn-exit-game").click(); ' +
                '  const modalVisible1 = document.getElementById("modal-exit-confirm").classList.contains("visible"); ' +
                '  document.getElementById("btn-exit-confirm").click(); ' +
                '  const isGameStartedAfterExit = app.isGameStarted; ' +
                '  const lobbyVisible = document.getElementById("modal-lobby").classList.contains("visible"); ' +
                '  return JSON.stringify({ modalVisible1, isGameStartedAfterExit, lobbyVisible }); ' +
                '})()'

    $payload2 = '{"id":4,"method":"Runtime.evaluate","params":{"expression":' + ($exitExpr | ConvertTo-Json) + '}}'
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes($payload2), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    for ($i = 0; $i -lt 15; $i++) {
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
        if ($msg -match '"id":4') {
            Write-Host "EXIT TEST: $msg"
            break
        }
    }

    # 3. Test Briefing Modal Back button
    $backExpr = '(() => { ' +
                '  const app = window.gameApp; ' +
                '  app._showStrategicBriefing(); ' +
                '  const briefingVisible = document.getElementById("modal-briefing").classList.contains("visible"); ' +
                '  document.getElementById("btn-briefing-back").click(); ' +
                '  const briefingVisibleAfterBack = document.getElementById("modal-briefing").classList.contains("visible"); ' +
                '  const lobbyVisibleAfterBack = document.getElementById("modal-lobby").classList.contains("visible"); ' +
                '  return JSON.stringify({ briefingVisible, briefingVisibleAfterBack, lobbyVisibleAfterBack }); ' +
                '})()'

    $payload3 = '{"id":5,"method":"Runtime.evaluate","params":{"expression":' + ($backExpr | ConvertTo-Json) + '}}'
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes($payload3), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    for ($i = 0; $i -lt 15; $i++) {
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
        if ($msg -match '"id":5') {
            Write-Host "BRIEFING BACK TEST: $msg"
            break
        }
    }

} catch {
    Write-Host "Test Error: $_"
} finally {
    if ($ws) { $ws.Dispose() }
    Stop-Process -Id $proc.Id -Force
}
