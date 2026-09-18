$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json

$minLon = -14.0; $maxLon = 48.0; $minLat = 31.5; $maxLat = 71.5
$canvasW = 2400.0; $canvasH = 1600.0

function MercN($latDeg) {
    $latRad = $latDeg * [Math]::PI / 180.0
    return [Math]::Log([Math]::Tan([Math]::PI / 4.0 + $latRad / 2.0))
}
$minMerc = MercN $minLat
$maxMerc = MercN $maxLat

function ProjectLonLat($lon, $lat) {
    $x = (($lon - $script:minLon) / ($script:maxLon - $script:minLon)) * $script:canvasW
    $m = MercN $lat
    $y = $script:canvasH - (($m - $script:minMerc) / ($script:maxMerc - $script:minMerc)) * $script:canvasH
    return @([Math]::Round($x, 1), [Math]::Round($y, 1))
}

function CalculateCentroid($rings) {
    $bestArea = -1.0
    $bestCx = 0.0
    $bestCy = 0.0

    foreach ($ring in $rings) {
        $n = $ring.Count
        if ($n -lt 3) { continue }
        $a = 0.0
        $cx = 0.0
        $cy = 0.0
        for ($i = 0; $i -lt $n - 1; $i++) {
            $p1 = ProjectLonLat $ring[$i][0] $ring[$i][1]
            $p2 = ProjectLonLat $ring[$i+1][0] $ring[$i+1][1]
            $cross = ($p1[0] * $p2[1]) - ($p2[0] * $p1[1])
            $a += $cross
            $cx += ($p1[0] + $p2[0]) * $cross
            $cy += ($p1[1] + $p2[1]) * $cross
        }
        $area = [Math]::Abs($a / 2.0)
        if ($area -gt $bestArea -and [Math]::Abs($a) -gt 0.0001) {
            $bestArea = $area
            $bestCx = $cx / (3.0 * $a)
            $bestCy = $cy / (3.0 * $a)
        }
    }
    return @([Math]::Round($bestCx, 0), [Math]::Round($bestCy, 0))
}

Write-Host "--- Computed Feature Centroids on 2400x1600: ---"
foreach ($f in $raw.features) {
    $iso = $f.properties.ISO2
    $name = $f.properties.NAME
    $geom = $f.geometry
    $rings = @()
    if ($geom.type -eq "Polygon") {
        foreach ($r in $geom.coordinates) { $rings += ,$r }
    } elseif ($geom.type -eq "MultiPolygon") {
        foreach ($poly in $geom.coordinates) {
            foreach ($r in $poly) { $rings += ,$r }
        }
    }
    $c = CalculateCentroid $rings
    Write-Host ("{0,-4} {1,-24} X:{2,-5} Y:{3,-5}" -f $iso, $name, $c[0], $c[1])
}
