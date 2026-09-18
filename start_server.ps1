# start_server.ps1 - War Room 1942 Lightweight Local Server
param(
    [int]$port = 51942,
    [switch]$NoBrowser
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "  WAR ROOM 1942: ASKERI KOMUTA MERKEZI CALISIYOR" -ForegroundColor Green
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
    Write-Host "  Adres: http://localhost:$port/" -ForegroundColor Yellow
    if (-not $NoBrowser) {
        Write-Host "  Tarayiciniz otomatik olarak aciliyor..." -ForegroundColor White
    }
    Write-Host "  Kapatmak icin bu pencereyi kapatmaniz yeterlidir." -ForegroundColor Gray
    Write-Host "=================================================================" -ForegroundColor Cyan

    # Tarayiciyi otomatik olarak oyuna yonlendir
    if (-not $NoBrowser) {
        Start-Process "http://localhost:$port/"
    }
} catch {
    Write-Host "Port $port baslatilamadi: $_" -ForegroundColor Red
    exit 1
}

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json"    = "application/json; charset=utf-8"
    ".geojson" = "application/geo+json; charset=utf-8"
    ".svg"     = "image/svg+xml"
    ".png"     = "image/png"
    ".jpg"     = "image/jpeg"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath
        if ($request.HttpMethod -eq "POST" -and $rawPath -eq "/api/test-result") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $postBody = $reader.ReadToEnd()
            [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "test_result.json"), $postBody)
            $response.StatusCode = 200
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Close()
            $response.Close()
            continue
        }

        if ($rawPath -eq "/" -or $rawPath -eq "") {
            $rawPath = "/index.html"
        }

        $cleanPath = $rawPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $localPath = Join-Path $PSScriptRoot $cleanPath

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.SendChunked = $true

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Close()
        } else {
            $response.StatusCode = 404
            $response.SendChunked = $true
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.OutputStream.Close()
        }
        $response.Close()
    } catch {
        # Istek hatalarini sessizce yut ve dinlemeye devam et
    }
}
