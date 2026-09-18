$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json

$minLon = -14.0; $maxLon = 48.0; $minLat = 31.5; $maxLat = 71.5
$canvasW = 2400.0; $canvasH = 1600.0

function MercN($latDeg) {
    $latRad = $latDeg * [Math]::PI / 180.0
    return [Math]::Log([Math]::Tan([Math]::PI / 4.0 + $latRad / 2.0))
}
$minMerc = MercN $minLat
$maxMerc = MercN $maxLat

$totalPoints = 0
$nanCount = 0

foreach ($f in $raw.features) {
    $geom = $f.geometry
    $polys = if ($geom.type -eq "MultiPolygon") { $geom.coordinates } else { @(,$geom.coordinates) }
    foreach ($p in $polys) {
        foreach ($ring in $p) {
            foreach ($pt in $ring) {
                $totalPoints++
                $lon = [double]$pt[0]; $lat = [double]$pt[1]
                $x = (($lon - $minLon) / ($maxLon - $minLon)) * $canvasW
                $m = MercN $lat
                $y = $canvasH - (($m - $minMerc) / ($maxMerc - $minMerc)) * $canvasH
                if ([double]::IsNaN($x) -or [double]::IsNaN($y) -or [double]::IsInfinity($x) -or [double]::IsInfinity($y)) {
                    $nanCount++
                }
            }
        }
    }
}

Write-Host "Total vertices projected: $totalPoints"
Write-Host "Invalid/NaN vertices: $nanCount"
