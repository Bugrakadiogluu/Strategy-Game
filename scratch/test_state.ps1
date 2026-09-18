$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/?autostart=singleplayer&faction=turkey&skipbriefing=1"
$artifactDir = "C:\Users\bugra.kadioglu\.gemini\antigravity-ide\brain\03203fc1-1f8e-4850-a407-9b0540dea9e1"
$targetShot = "$artifactDir\gameplay_verified.png"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9222", "--window-size=1600,1000", "$url" -PassThru
Start-Sleep -Seconds 4

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*8085*" }
    if (!$pageTab) { $pageTab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1 }
    $wsUrl = [Uri]$pageTab.webSocketDebuggerUrl
    Write-Host "Connecting to: $($pageTab.title) ($wsUrl)"

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $cts.CancelAfter(8000)
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    # Enable Runtime & Page
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes('{"id":1,"method":"Runtime.enable"}'), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    Start-Sleep -Milliseconds 400

    # Evaluate gameApp state
    $expr = 'JSON.stringify({ ' +
            '  regionsTotal: Object.keys(window.gameApp.gameState.regions).length, ' +
            '  turkeyCount: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "turkey").length, ' +
            '  turkeyProvinces: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "turkey").map(r => r.id), ' +
            '  germanyCount: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "germany").length, ' +
            '  ussrCount: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "ussr").length, ' +
            '  ukCount: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "uk").length, ' +
            '  franceCount: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "france").length, ' +
            '  italyCount: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "italy").length, ' +
            '  spainCount: Object.values(window.gameApp.gameState.regions).filter(r => r.owner === "spain").length, ' +
            '  turkeyCapital: window.gameApp.gameState.factions.turkey.capitalRegionId, ' +
            '  aiDifficulty: window.gameApp.gameState.aiDifficulty, ' +
            '  isAlliedWithGermany: window.gameApp.gameState.isAllied("turkey", "germany"), ' +
            '  allianceAcceptanceGermany: window.gameApp.gameState.getAllianceAcceptanceChance("turkey", "germany") ' +
            '})'

    $evalPayload = '{"id":2,"method":"Runtime.evaluate","params":{"expression":' + ($expr | ConvertTo-Json) + '}}'
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes($evalPayload), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    $buf = New-Object byte[] 65536
    for ($i = 0; $i -lt 15; $i++) {
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
        if ($msg -match '"id":2') {
            Write-Host "GAME_STATE_DATA: $msg"
            break
        }
    }
} catch {
    Write-Host "Test Error: $_"
} finally {
    if ($ws) { $ws.Dispose() }
    Stop-Process -Id $proc.Id -Force
}
