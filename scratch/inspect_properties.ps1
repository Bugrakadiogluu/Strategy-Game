$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json
$raw.features[0].properties | Format-List
Write-Host "--- LAT & LON in properties: ---"
foreach ($f in $raw.features) {
    Write-Host ("{0,-4} {1,-4} {2,-25} LAT:{3,-8} LON:{4,-8}" -f $f.properties.ISO2, $f.properties.FIPS, $f.properties.NAME, $f.properties.LAT, $f.properties.LON)
}
