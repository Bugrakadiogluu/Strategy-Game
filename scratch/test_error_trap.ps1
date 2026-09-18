$htmlPath = "c:\Users\bugra.kadioglu\Desktop\BELGELER\Game\index.html"
$content = Get-Content -Raw -Encoding UTF8 $htmlPath

# Temporarily check if window.__errors has anything
$testScript = @"
<script>
window.__errors = [];
window.onerror = function(msg, url, line, col, error) {
    window.__errors.push({ msg: msg, line: line, col: col, stack: error ? error.stack : '' });
    console.error("PAGE_ERROR:", msg, line, error);
};
</script>
"@
