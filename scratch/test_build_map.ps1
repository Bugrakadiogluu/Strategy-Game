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

$regions = @{}
foreach ($f in $raw.features) {
    $iso = $f.properties.ISO2.ToLower()
    $name = $f.properties.NAME
    $regions[$iso] = @{
        id = $iso
        name = $name
        fips = $f.properties.FIPS
        geomType = $f.geometry.type
    }
}

Write-Host "Total built regions: $($regions.Count)"
Write-Host "Checking Germany (de): $($regions['de'].name)"
Write-Host "Checking France (fr): $($regions['fr'].name)"
Write-Host "Checking UK (gb): $($regions['gb'].name)"
Write-Host "Checking Russia (ru): $($regions['ru'].name)"
Write-Host "Checking Italy (it): $($regions['it'].name)"
Write-Host "Checking Spain (es): $($regions['es'].name)"
Write-Host "Checking Turkey (tr): $($regions['tr'].name)"
