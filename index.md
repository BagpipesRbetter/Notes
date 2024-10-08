
---
parent: "[[Personal]]"
tags:
	#Personal
	#Web
	#Dev


---

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
            cursor: pointer;
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
        .nested {
            display: none;
            margin-left: 20px;
        }
        .active {
            display: block;
        }
    </style>
</head>
<body>
    <h1>Notes</h1>
    <div class="file-list" id="file-list">Loading files...</div>
    <div class="markdown-view" id="markdown-view">Select a file to view its content.</div>

    <script>
        const repoOwner = 'BagpipesRbetter';
        const repoName = 'Notes';
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

        const fileListDiv = document.getElementById('file-list');
        const markdownViewDiv = document.getElementById('markdown-view');

        // Function to toggle visibility of nested directories
        const toggleVisibility = (event) => {
            const element = event.target;
            const nestedList = element.nextElementSibling;
            if (nestedList) {
                nestedList.classList.toggle("active");
            }
        };

        // Fetch directory content recursively
        const fetchFiles = async (url, parentElement) => {
            try {
                const response = await fetch(url);
                const files = await response.json();

                if (Array.isArray(files)) {
                    const list = document.createElement('div');
                    list.classList.add('nested');

                    for (let file of files) {
                        const fileLink = document.createElement('a');
                        fileLink.href = '#';
                        fileLink.textContent = file.name;

                        if (file.type === 'file' && file.name.endsWith('.md')) {
                            // Add markdown file links
                            fileLink.addEventListener('click', async (e) => {
                                e.preventDefault();
                                await fetchAndRenderMarkdown(file.path);
                            });
                            list.appendChild(fileLink);
                            list.appendChild(document.createElement('br'));
                        } else if (file.type === 'dir') {
                            // Create collapsible directory
                            const dirLink = document.createElement('a');
                            dirLink.href = '#';
                            dirLink.textContent = file.name + '/';
                            dirLink.addEventListener('click', toggleVisibility);

                            const dirDiv = document.createElement('div');
                            dirDiv.appendChild(dirLink);
                            list.appendChild(dirDiv);

                            // Fetch files recursively for this directory
                            await fetchFiles(file.url, dirDiv);
                        }
                    }
                    parentElement.appendChild(list);
                } else {
                    console.error('Error: Response is not an array:', files);
                    fileListDiv.textContent = 'Error: Unexpected response from GitHub API.';
                }
            } catch (error) {
                console.error('Error:', error);
                fileListDiv.textContent = `Error loading files: ${error.message}`;
            }
        };

        // Fetch and display markdown content
        const fetchAndRenderMarkdown = async (filePath) => {
            const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filePath}`;
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

        // Call the function to fetch files from the root directory
        fetchFiles(apiUrl, fileListDiv);
    </script>
</body>
</html>
