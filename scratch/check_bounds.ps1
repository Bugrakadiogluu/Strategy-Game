$raw = Get-Content -Raw -Encoding UTF8 europe.geojson
$json = ConvertFrom-Json $raw

$minLon = 999.0
$maxLon = -999.0
$minLat = 999.0
$maxLat = -999.0

function ProcessCoords($coords) {
    if ($coords[0] -is [System.Array] -and $coords[0][0] -is [System.Array]) {
        foreach ($c in $coords) { ProcessCoords $c }
    } elseif ($coords[0] -is [System.Array]) {
        foreach ($pt in $coords) {
            $lon = [double]$pt[0]
            $lat = [double]$pt[1]
            if ($lon -lt $script:minLon) { $script:minLon = $lon }
            if ($lon -gt $script:maxLon) { $script:maxLon = $lon }
            if ($lat -lt $script:minLat) { $script:minLat = $lat }
            if ($lat -gt $script:maxLat) { $script:maxLat = $lat }
        }
    }
}

foreach ($f in $json.features) {
    ProcessCoords $f.geometry.coordinates
}

Write-Host "Overall bounds:"
Write-Host "Lon: $minLon to $maxLon"
Write-Host "Lat: $minLat to $maxLat"
