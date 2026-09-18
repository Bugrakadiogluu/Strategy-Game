$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$port = 51950
$url = "http://localhost:$port/?autostart=singleplayer&faction=germany&skipbriefing=1&select=de"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9222", "$url" -PassThru
Start-Sleep -Seconds 2

$ws = New-Object System.Net.WebSockets.ClientWebSocket
$cts = New-Object System.Threading.CancellationTokenSource
$cts.CancelAfter(5000)

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $wsUrl = [Uri]$tabs[0].webSocketDebuggerUrl
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    # Enable Runtime and Log
    $enableCmd = '{"id":1,"method":"Runtime.enable"}'
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($enableCmd)
    $null = $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    $buf = New-Object byte[] 8192
    for ($i = 0; $i -lt 10; $i++) {
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
        if ($msg -match "exceptionThrown" -or $msg -match "consoleAPICalled" -or $msg -match "error") {
            Write-Host "LOG: $msg"
        }
    }
} catch {
    Write-Host "Error: $_"
} finally {
    $ws.Dispose()
    Stop-Process -Id $proc.Id -Force
}
