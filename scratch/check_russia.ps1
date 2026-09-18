$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json
$russia = $raw.features | Where-Object { $_.properties.ISO2 -eq "RU" }
Write-Host "Russia geometry type: $($russia.geometry.type)"
Write-Host "Russia polygon count: $($russia.geometry.coordinates.Count)"
$minLon = 999.0; $maxLon = -999.0; $minLat = 999.0; $maxLat = -999.0
foreach ($poly in $russia.geometry.coordinates) {
    foreach ($ring in $poly) {
        foreach ($pt in $ring) {
            $lon = [double]$pt[0]; $lat = [double]$pt[1]
            if ($lon -lt $minLon) { $minLon = $lon }
            if ($lon -gt $maxLon) { $maxLon = $lon }
            if ($lat -lt $minLat) { $minLat = $lat }
            if ($lat -gt $maxLat) { $maxLat = $lat }
        }
    }
}
Write-Host "Russia bounds: Lon $minLon to $maxLon, Lat $minLat to $maxLat"
