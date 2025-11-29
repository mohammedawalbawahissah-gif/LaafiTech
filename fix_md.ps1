$filePath = 'c:\Users\weezy\Desktop\LaafiTech\DEVELOPMENT_GUIDE.md'
$content = Get-Content $filePath -Raw

# Remove markdown fence at start
$content = $content -replace '^\```markdown\r?\n', ''

# Fix numbered lists
$content = $content -replace '(?<=\r?\n)2\. Make changes', '1. Make changes'
$content = $content -replace '(?<=\r?\n)3\. Run tests', '1. Run tests'

# Remove excess blank lines at end
$content = $content.TrimEnd() + "`n"

# Write back
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "File fixed"
