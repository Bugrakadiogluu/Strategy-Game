$raw = Get-Content -Raw -Encoding UTF8 europe.geojson
$targetDir = "$PSScriptRoot/../js/data"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}
$targetFile = "$targetDir/europeGeoJson.js"
$content = "/**`n * europeGeoJson.js - Real-world European Theater GeoJSON Embedded Dataset`n */`nexport const EUROPE_GEOJSON = " + $raw + ";`n"
[System.IO.File]::WriteAllText($targetFile, $content, [System.Text.Encoding]::UTF8)
Write-Host "Created $targetFile successfully! Size: $([System.IO.FileInfo]::new($targetFile).Length) bytes"
