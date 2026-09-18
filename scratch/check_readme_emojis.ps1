$content = [System.IO.File]::ReadAllText("$PSScriptRoot\..\README.md", [System.Text.Encoding]::UTF8)
$hasEmoji = $content -match '[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]'
Write-Host "README HAS EMOJI: $hasEmoji"
if ($hasEmoji) {
    Write-Host "Matched emoji characters found!"
} else {
    Write-Host "README is 100% clean and emojisiz!"
}
