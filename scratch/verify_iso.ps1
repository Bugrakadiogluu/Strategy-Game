$raw = Get-Content -Raw -Encoding UTF8 europe.geojson | ConvertFrom-Json

Write-Host "Verifying GeoJSON features and country mapping..."
$isoList = $raw.features | ForEach-Object { $_.properties.ISO2 }
Write-Host "Total ISO2 features: $($isoList.Count)"
Write-Host "Unique ISO2 features: $(($isoList | Select-Object -Unique).Count)"
