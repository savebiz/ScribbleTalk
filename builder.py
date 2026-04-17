import os
import re

source_file = 'scribbletalk_mvp.html'
with open(source_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
css_content = style_match.group(1).strip() if style_match else ''

# Extract JS
script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
js_content = script_match.group(1).strip() if script_match else ''

# Extract Body without Scripts
body_match = re.search(r'<body>(.*?)<script>', content, re.DOTALL)
html_body = body_match.group(1).strip() if body_match else ''

# Ensure folders exist
os.makedirs('styles', exist_ok=True)
os.makedirs('js', exist_ok=True)

# Write CSS
with open('styles/main.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

# Write HTML Template
index_html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>ScribbleTalk</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles/main.css">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#FAF7F4">
<script src="https://unpkg.com/dexie@3.2.4/dist/dexie.js"></script>
</head>
<body>
''' + html_body + '''

<!-- Application Scripts -->
<script src="js/db.js"></script>
<script src="js/canvas.js"></script>
<script src="js/parent.js"></script>
<script src="js/app.js"></script>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(err => console.log('SW registration failed:', err));
    });
  }
</script>
</body>
</html>
'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)

# Write legacy JS to app.js
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print('Base architecture split accomplished.')
