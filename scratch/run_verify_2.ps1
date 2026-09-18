$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://localhost:8085/"
$proc = Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--disable-gpu", "--remote-debugging-port=9229", "--window-size=1600,1000", "$url" -PassThru
Start-Sleep -Seconds 4

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9229/json"
    $pageTab = $tabs | Where-Object { $_.type -eq "page" -and $_.url -like "*8085*" } | Select-Object -First 1
    $wsUrl = [Uri]$pageTab.webSocketDebuggerUrl

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource(10000)
    $task = $ws.ConnectAsync($wsUrl, $cts.Token)
    $task.Wait()

    # Read test script
    $testScript = [System.IO.File]::ReadAllText("$PSScriptRoot\verify_overhaul_2.js", [System.Text.Encoding]::UTF8)

    $payload = @{
        id = 1
        method = "Runtime.evaluate"
        params = @{
            expression = $testScript
            returnByValue = $true
        }
    } | ConvertTo-Json -Compress

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $null = $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token)

    $buf = New-Object byte[] 65536
    $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token)
    $res.Wait()

    $msg = [System.Text.Encoding]::UTF8.GetString($buf, 0, $res.Result.Count)
    Write-Host "AUTOMATED_TEST_RESULT: $msg"
} catch {
    Write-Host "Error running test: $_"
} finally {
    if ($ws) { $ws.Dispose() }
    Stop-Process -Id $proc.Id -Force
}
