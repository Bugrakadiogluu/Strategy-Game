$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json

Write-Host "Analyzing boundary vertex sharing across 51 features..."

# Build spatial hash of rounded coordinates (e.g. rounded to 2 decimal places ~ 1km)
$vertexMap = @{}

for ($i = 0; $i -lt $raw.features.Count; $i++) {
    $f = $raw.features[$i]
    $iso = $f.properties.ISO2
    $geom = $f.geometry

    $polygons = @()
    if ($geom.type -eq "Polygon") { $polygons += ,$geom.coordinates }
    elseif ($geom.type -eq "MultiPolygon") { $polygons = $geom.coordinates }

    foreach ($poly in $polygons) {
        foreach ($ring in $poly) {
            foreach ($pt in $ring) {
                $k = "{0:N2},{1:N2}" -f [double]$pt[0], [double]$pt[1]
                if (-not $vertexMap.ContainsKey($k)) {
                    $vertexMap[$k] = [System.Collections.Generic.HashSet[string]]::new()
                }
                $null = $vertexMap[$k].Add($iso)
            }
        }
    }
}

$neighbors = @{}
foreach ($k in $vertexMap.Keys) {
    $set = $vertexMap[$k]
    if ($set.Count -gt 1) {
        foreach ($c1 in $set) {
            if (-not $neighbors.ContainsKey($c1)) {
                $neighbors[$c1] = [System.Collections.Generic.HashSet[string]]::new()
            }
            foreach ($c2 in $set) {
                if ($c1 -ne $c2) {
                    $null = $neighbors[$c1].Add($c2)
                }
            }
        }
    }
}

Write-Host "--- Computed Adjacencies (Shared Boundaries): ---"
foreach ($k in ($neighbors.Keys | Sort-Object)) {
    $list = ($neighbors[$k] | Sort-Object) -join ", "
    Write-Host ("{0,-4} neighbors: {1}" -f $k, $list)
}
