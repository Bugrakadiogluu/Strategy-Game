$minLon = -15.0
$maxLon = 49.0
$minLat = 30.0
$maxLat = 71.5

$width = 2400.0
$height = 1600.0

function MercN($latDeg) {
    $latRad = $latDeg * [Math]::PI / 180.0
    return [Math]::Log([Math]::Tan([Math]::PI / 4.0 + $latRad / 2.0))
}

$minMerc = MercN $minLat
$maxMerc = MercN $maxLat

function Project($lon, $lat) {
    $x = (($lon - $script:minLon) / ($script:maxLon - $script:minLon)) * $script:width
    $m = MercN $lat
    $y = $script:height - (($m - $script:minMerc) / ($script:maxMerc - $script:minMerc)) * $script:height
    return @($x, $y)
}

Write-Host "Sample Points Projected (2400x1600):"
$samples = @(
    @{ Name="London"; Lon=-0.12; Lat=51.5 },
    @{ Name="Berlin"; Lon=13.40; Lat=52.52 },
    @{ Name="Paris"; Lon=2.35; Lat=48.85 },
    @{ Name="Rome"; Lon=12.49; Lat=41.9 },
    @{ Name="Madrid"; Lon=-3.70; Lat=40.41 },
    @{ Name="Ankara"; Lon=32.85; Lat=39.93 },
    @{ Name="Moscow"; Lon=37.61; Lat=55.75 },
    @{ Name="Stockholm"; Lon=18.06; Lat=59.32 },
    @{ Name="Athens"; Lon=23.72; Lat=37.98 },
    @{ Name="Oslo"; Lon=10.75; Lat=59.91 }
)

foreach ($s in $samples) {
    $pt = Project $s.Lon $s.Lat
    Write-Host ("{0,-12}: X={1:N1}, Y={2:N1}" -f $s.Name, $pt[0], $pt[1])
}
