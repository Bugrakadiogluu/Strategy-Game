$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json

# Bounding settings
$minLon = -14.0
$maxLon = 48.0
$minLat = 32.0
$maxLat = 71.5

$canvasW = 2400.0
$canvasH = 1600.0

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

# Generate SVG
$svg = New-Object System.Text.StringBuilder
$null = $svg.AppendLine("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 $canvasW $canvasH' width='$canvasW' height='$canvasH' style='background:#0a0e17;'>")

foreach ($f in $raw.features) {
    $iso = $f.properties.ISO2
    $name = $f.properties.NAME
    $geom = $f.geometry

    $polygons = @()
    if ($geom.type -eq "Polygon") {
        $polygons += ,$geom.coordinates
    } elseif ($geom.type -eq "MultiPolygon") {
        $polygons = $geom.coordinates
    }

    $pathData = ""
    foreach ($poly in $polygons) {
        foreach ($ring in $poly) {
            $cmd = "M"
            foreach ($pt in $ring) {
                $p = ProjectLonLat $pt[0] $pt[1]
                $pathData += "$cmd $($p[0]),$($p[1]) "
                $cmd = "L"
            }
            $pathData += "Z "
        }
    }

    $null = $svg.AppendLine("<path d='$pathData' fill='#1e293b' stroke='#38bdf8' stroke-width='1.2' opacity='0.85'><title>$name ($iso)</title></path>")
}

$null = $svg.AppendLine("</svg>")
[System.IO.File]::WriteAllText("$PSScriptRoot/../scratch/test_europe.svg", $svg.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Generated scratch/test_europe.svg successfully!"
