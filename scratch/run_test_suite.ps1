$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/?autostart=singleplayer&faction=turkey&skipbriefing=1"

$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9222", "$url" -PassThru
Start-Sleep -Seconds 4

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*8085*" } | Select-Object -First 1
    $wsUrl = [Uri]$pageTab.webSocketDebuggerUrl

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $cts.CancelAfter(8000)
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    # Enable Runtime
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes('{"id":1,"method":"Runtime.enable"}'), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    Start-Sleep -Milliseconds 400

    $pureString = [System.IO.File]::ReadAllText("c:\Users\bugra.kadioglu\Desktop\BELGELER\Game\scratch\test_suite.js")
    $reqObj = @{
        id = 2
        method = "Runtime.evaluate"
        params = @{
            expression = $pureString
        }
    }
    $evalPayload = $reqObj | ConvertTo-Json -Compress
    $null = $ws.SendAsync([ArraySegment[byte]][System.Text.Encoding]::UTF8.GetBytes($evalPayload), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    $buf = New-Object byte[] 65536
    for ($i = 0; $i -lt 15; $i++) {
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
        $res.Wait()
        $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
        if ($msg -match '"id":2') {
            Write-Host "AUTOMATED_SUITE_RESULT: $msg"
            break
        }
    }
} catch {
    Write-Host "Test Error: $_"
} finally {
    if ($ws) { $ws.Dispose() }
    Stop-Process -Id $proc.Id -Force
}
