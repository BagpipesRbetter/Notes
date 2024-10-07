
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
    <title>Notes Browser</title>
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
    <div class="file-list" id="file-list"></div>
    <div class="markdown-view" id="markdown-view"></div>

    <script>
        const baseDir = './';
        const files = [];

        // Function to fetch and render file list
        const fetchFiles = async () => {
            try {
                const response = await fetch(baseDir);
                const text = await response.text();

                const regex = /href="(.*?\.md)"/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    files.push(match[1]);
                }

                displayFiles();
            } catch (error) {
                document.getElementById('file-list').textContent = 'Error loading files.';
            }
        };

        // Function to display the file list
        const displayFiles = () => {
            const fileListDiv = document.getElementById('file-list');
            if (files.length === 0) {
                fileListDiv.textContent = 'No files found.';
                return;
            }

            files.forEach(file => {
                const fileName = file.split('/').pop();
                const fileLink = document.createElement('a');
                fileLink.href = '#';
                fileLink.textContent = fileName;

                // Add event listener to fetch and render the clicked file's content
                fileLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetchAndRenderMarkdown(file);
                });

                fileListDiv.appendChild(fileLink);
                fileListDiv.appendChild(document.createElement('br'));
            });
        };

        // Function to fetch and render markdown file content
        const fetchAndRenderMarkdown = async (file) => {
            try {
                const response = await fetch(file);
                const markdownText = await response.text();
                
                // Use basic markdown formatting for display
                const htmlContent = markdownText
                    .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')
                    .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>'); // simple line breaks

                document.getElementById('markdown-view').innerHTML = htmlContent;
            } catch (error) {
                document.getElementById('markdown-view').textContent = 'Error loading file content.';
            }
        };

        fetchFiles();
    </script>
</body>
</html>
