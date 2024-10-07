
---
parent: "[[Personal]]"
tags:
	#Personal
	#Web
	#Dev


---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Notes Browser</title>
    <style>
        body {
            background-color: #111;
            color: #eee;
            font-family: monospace;
            padding: 20px;
        }
        a {
            color: #0f0;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .file-list {
            white-space: pre;
        }
        .markdown-view {
            border-top: 1px solid #444;
            margin-top: 20px;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Notes</h1>
    <div class="file-list" id="file-list">Loading files...</div>
    <div class="markdown-view" id="markdown-view">Select a file to view its content.</div>

    <script>
        const repoOwner = 'your-username';
        const repoName = 'your-repo';
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

        const fileListDiv = document.getElementById('file-list');
        const markdownViewDiv = document.getElementById('markdown-view');

        // Fetch directory content recursively
        const fetchFiles = async (url) => {
            try {
                const response = await fetch(url);
                const files = await response.json();

                for (let file of files) {
                    if (file.type === 'file' && file.name.endsWith('.md')) {
                        // Add markdown file links
                        const fileLink = document.createElement('a');
                        fileLink.href = '#';
                        fileLink.textContent = file.path; // Display full path for context

                        fileLink.addEventListener('click', async (e) => {
                            e.preventDefault();
                            await fetchAndRenderMarkdown(file.path);
                        });

                        fileListDiv.appendChild(fileLink);
                        fileListDiv.appendChild(document.createElement('br'));
                    } else if (file.type === 'dir') {
                        // Recursively fetch files in subdirectories
                        await fetchFiles(file.url);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                fileListDiv.textContent = 'Error loading files.';
            }
        };

        // Fetch and display markdown content
        const fetchAndRenderMarkdown = async (filePath) => {
            const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/master/${filePath}`;
            try {
                const response = await fetch(rawUrl);
                const markdownText = await response.text();

                const htmlContent = markdownText
                    .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')
                    .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');

                markdownViewDiv.innerHTML = htmlContent;
            } catch (error) {
                console.error('Error:', error);
                markdownViewDiv.textContent = 'Error loading file content.';
            }
        };

        fetchFiles(apiUrl);
    </script>
</body>
</html>
