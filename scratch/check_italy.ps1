$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json
$italy = $raw.features | Where-Object { $_.properties.NAME -like "*Italy*" }
Write-Host "Italy ISO2: '$($italy.properties.ISO2)'"
Write-Host "Italy FIPS: '$($italy.properties.FIPS)'"
Write-Host "Italy NAME: '$($italy.properties.NAME)'"
