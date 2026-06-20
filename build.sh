#!/usr/bin/env bash
set -euo pipefail

OUT="dist/prompt-master-v6.html"
mkdir -p dist

python3 - <<'EOF'
with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('src/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

with open('src/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace(
    '<link rel="stylesheet" href="style.css">',
    f'<style>\n{css}\n</style>'
)
html = html.replace(
    '<script src="app.js"></script>',
    f'<script>\n{js}\n</script>'
)

with open('dist/prompt-master-v6.html', 'w', encoding='utf-8') as f:
    f.write(html)

size_kb = len(html.encode('utf-8')) / 1024
print(f'✅ dist/prompt-master-v6.html  ({size_kb:.1f} KB)')
EOF
