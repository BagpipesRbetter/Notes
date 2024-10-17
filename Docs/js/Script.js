const repoOwner = 'BagpipesRbetter';
const repoName = 'Notes';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

const lastUpdatedDiv = document.getElementById('last-updated');
const markdownViewDiv = document.getElementById('markdown-view');

// Fetch the last updated date from the GitHub repository
const fetchLastUpdatedDate = async () => {
  const repoInfoUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
  try {
    const response = await fetch(repoInfoUrl);
    const repoData = await response.json();
    const lastPushDate = new Date(repoData.pushed_at).toLocaleString();
    lastUpdatedDiv.textContent = `Last updated: ${lastPushDate}`;
  } catch (error) {
    console.error('Error fetching last updated date:', error);
    lastUpdatedDiv.textContent = 'Error fetching last updated date.';
  }
};

// Recursively build the file tree data from the GitHub API
const buildTreeData = async (url) => {
  const response = await fetch(url);
  const files = await response.json();
  const treeData = [];

  for (let file of files) {
    if (file.type === 'file' && file.name.endsWith('.md')) {
      treeData.push({ text: file.name, id: file.path, icon: "jstree-file" });
    } else if (file.type === 'file' && /\.(jpg|jpeg|png|gif|svg)$/i.test(file.name)) {
      treeData.push({ text: file.name, id: file.path, icon: "jstree-image" });
    } else if (file.type === 'dir') {
      treeData.push({
        text: file.name,
        id: file.path,
        children: await buildTreeData(file.url),
        icon: "jstree-folder"
      });
    }
  }

  return treeData;
};

// Render the file tree using jstree
const renderTree = async () => {
  const treeData = await buildTreeData(apiUrl);
  $('#file-tree').jstree({
    'core': {
      'data': treeData
    }
  });

  // Event listener for when a file is clicked
  $('#file-tree').on('select_node.jstree', async (e, data) => {
    if (data.node.children.length === 0) { // Only if it's a file
      await fetchAndRenderMarkdown(data.node.id);
    }
  });
};

// Fetch and render the selected Markdown file
const fetchAndRenderMarkdown = async (filePath) => {
  const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filePath}`;
  console.log('Fetching Markdown from:', rawUrl);

  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const markdownText = await response.text();
    markdownViewDiv.innerHTML = marked.parse(markdownText);
  } catch (error) {
    console.error('Error fetching or rendering Markdown:', error);
    markdownViewDiv.textContent = 'Error loading file content. Check the console for details.';
  }

  window.scrollTo(0, 0);
};

// Load the README.md file initially
const loadReadme = async () => {
  await fetchAndRenderMarkdown('README.md');
};

// Initial setup
renderTree();
loadReadme();
fetchLastUpdatedDate();
