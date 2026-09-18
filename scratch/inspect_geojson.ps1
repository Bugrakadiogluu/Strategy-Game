$raw = Get-Content -Raw -Encoding UTF8 europe.geojson
$json = ConvertFrom-Json $raw
Write-Host "Total features: $($json.features.Count)"
foreach ($f in $json.features) {
    $p = $f.properties
    $t = $f.geometry.type
    Write-Host ("{0,-4} {1,-4} {2,-30} {3}" -f $p.ISO2, $p.FIPS, $p.NAME, $t)
}
