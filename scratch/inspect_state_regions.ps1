$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/?autostart=singleplayer&faction=germany&skipbriefing=1"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9228", "--window-size=1600,1000", "$url" -PassThru
Start-Sleep -Seconds 4

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9228/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*8085*" } | Select-Object -First 1
    $wsUrl = [Uri]$pageTab.webSocketDebuggerUrl

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(10000)
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    # Query gameState.regions
    $expr = '(() => {
        const gs = window.gameApp.gameState;
        const allKeys = Object.keys(gs.regions);
        const deRegions = Object.values(gs.regions).filter(r => r.owner === "germany").map(r => ({ id: r.id, name: r.name, hasPath: !!r.path2d, svgLen: (r.svgPath||"").length, polyCount: (r.projectedPolygons||[]).length, x: r.x, y: r.y }));
        const ruRegions = Object.values(gs.regions).filter(r => r.owner === "ussr").map(r => ({ id: r.id, name: r.name, hasPath: !!r.path2d, svgLen: (r.svgPath||"").length, polyCount: (r.projectedPolygons||[]).length, x: r.x, y: r.y }));
        return JSON.stringify({ totalKeys: allKeys.length, deCount: deRegions.length, deRegions, ruCount: ruRegions.length, ruRegions });
    })()'

    $payload = @{ id = 1; method = "Runtime.evaluate"; params = @{ expression = $expr } } | ConvertTo-Json -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $null = $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    $buf = New-Object byte[] 65536
    $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
    $res.Wait()
    $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
    Write-Host "REGIONS DIAGNOSTIC: $msg"
} catch {
    Write-Host "Error: $_"
} finally {
    if ($ws) { $ws.Dispose() }
    Stop-Process -Id $proc.Id -Force
}
