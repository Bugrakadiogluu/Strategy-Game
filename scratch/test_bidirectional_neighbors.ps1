# Dictionary of country neighbors
$neighbors = @{
    'de' = @('pl', 'cz', 'at', 'ch', 'fr', 'be', 'nl', 'dk', 'gb', 'lu')
    'at' = @('de', 'cz', 'sk', 'hu', 'si', 'it', 'ch', 'li')
    'cz' = @('de', 'pl', 'sk', 'at')
    'gb' = @('ie', 'fr', 'no', 'de', 'nl', 'is', 'mt', 'cy', 'fo')
    'ie' = @('gb')
    'is' = @('gb')
    'fo' = @('gb', 'no')
    'ru' = @('ua', 'by', 'ee', 'lv', 'fi', 'no', 'ge', 'az', 'pl', 'lt')
    'ua' = @('ru', 'by', 'pl', 'sk', 'hu', 'ro', 'md')
    'by' = @('ru', 'ua', 'pl', 'lt', 'lv')
    'md' = @('ua', 'ro')
    'ee' = @('ru', 'lv', 'fi')
    'lv' = @('ru', 'by', 'lt', 'ee')
    'lt' = @('ru', 'by', 'pl', 'lv')
    'it' = @('fr', 'ch', 'at', 'si', 'al', 'mt', 'gr', 'sm', 'va', 'mc')
    'al' = @('it', 'gr', 'mk', 'me', 'rs')
    'mt' = @('it', 'gb')
    'sm' = @('it')
    'va' = @('it')
    'fr' = @('gb', 'be', 'lu', 'de', 'ch', 'it', 'es', 'ad', 'mc')
    'be' = @('fr', 'nl', 'de', 'lu')
    'lu' = @('fr', 'be', 'de')
    'mc' = @('fr', 'it')
    'es' = @('fr', 'pt', 'ad')
    'pt' = @('es')
    'ad' = @('es', 'fr')
    'tr' = @('bg', 'gr', 'ge', 'am', 'az', 'cy', 'il')
    'ge' = @('tr', 'ru', 'az', 'am')
    'am' = @('tr', 'ge', 'az')
    'az' = @('tr', 'ru', 'ge', 'am')
    'cy' = @('tr', 'gb', 'gr', 'il')
    'il' = @('tr', 'cy')
    'pl' = @('de', 'cz', 'sk', 'ua', 'by', 'lt', 'ru')
    'ro' = @('ua', 'md', 'hu', 'rs', 'bg')
    'bg' = @('ro', 'rs', 'mk', 'gr', 'tr')
    'gr' = @('al', 'mk', 'bg', 'tr', 'it', 'cy')
    'hu' = @('at', 'sk', 'ua', 'ro', 'rs', 'hr', 'si')
    'sk' = @('cz', 'pl', 'ua', 'hu', 'at')
    'rs' = @('hu', 'ro', 'bg', 'mk', 'al', 'me', 'ba', 'hr')
    'hr' = @('si', 'hu', 'rs', 'ba', 'me')
    'ba' = @('hr', 'rs', 'me')
    'me' = @('ba', 'rs', 'al', 'hr')
    'mk' = @('rs', 'bg', 'gr', 'al')
    'si' = @('it', 'at', 'hu', 'hr')
    'se' = @('no', 'fi', 'dk')
    'no' = @('se', 'fi', 'ru', 'gb', 'fo', 'dk')
    'fi' = @('no', 'se', 'ru', 'ee')
    'dk' = @('de', 'se', 'no')
    'nl' = @('de', 'be', 'gb')
    'ch' = @('fr', 'de', 'at', 'it', 'li')
    'li' = @('ch', 'at')
}

$missing = 0
foreach ($c in $neighbors.Keys) {
    foreach ($n in $neighbors[$c]) {
        if (-not $neighbors.ContainsKey($n)) {
            Write-Host "ERROR: $c points to unknown neighbor $n"
            $missing++
        } elseif (-not ($neighbors[$n] -contains $c)) {
            Write-Host "ASYMMETRY: $c -> $n, but $n does not contain $c"
            $missing++
        }
    }
}

if ($missing -eq 0) {
    Write-Host "SUCCESS: All $($neighbors.Count) countries have 100% bidirectional neighbor links!"
} else {
    Write-Host "Found $missing issues to fix."
}
