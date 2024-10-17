// GitHub repository info
const repoOwner = "BagpipesRbetter";
const repoName = "Notes";
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

const lastUpdatedDiv = document.getElementById("last-updated");
const markdownViewDiv = document.getElementById("markdown-view");

// Fetch the last updated date from the GitHub repository
const fetchLastUpdatedDate = async () => {
  const repoInfoUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
  try {
    const response = await fetch(repoInfoUrl);
    const repoData = await response.json();
    const lastPushDate = new Date(repoData.pushed_at).toLocaleString();
    lastUpdatedDiv.textContent = `Last updated: ${lastPushDate}`;
  } catch (error) {
    console.error("Error fetching last updated date:", error);
    lastUpdatedDiv.textContent = "Error fetching last updated date.";
  }
};

const buildTreeData = async (url) => {
  const response = await fetch(url);
  const files = await response.json();
  const treeData = [];

  for (let file of files) {
    if (file.type === "file" && file.name.endsWith(".md")) {
      treeData.push({ title: file.name, path: file.path, icon: "file" });
    } else if (
      file.type === "file" &&
      /\.(jpg|jpeg|png|gif|svg)$/i.test(file.name)
    ) {
      treeData.push({ title: file.name, path: file.path, icon: "image" });
    } else if (file.type === "dir") {
      // Recursively build the child nodes for directories
      treeData.push({
        title: file.name,
        folder: true,
        children: await buildTreeData(file.url),
      });
    }
  }

  return treeData;
};


const renderTree = async () => {
  const treeData = await buildTreeData(apiUrl);

  // Initialize FancyTree with autoExpand and expanded options
  $("#file-tree").fancytree({
    source: treeData,
    autoExpand: true,  // Automatically expand all folders
    extensions: ["glyph"],
    glyph: {
      map: {
        // Custom icons for folder, open folder, and file
        folder: "custom-folder",
        folderOpen: "custom-folder-open",
        doc: "custom-file",
        image: "custom-image",
      },
    },
    // Apply expanded: true to each node
    init: function(event, data) {
      data.tree.visit(function(node){
        node.setExpanded(true);
      });
    },
    click: async function (event, data) {
      if (!data.node.folder) {
        await fetchAndRenderMarkdown(data.node.data.path);
      }
    },
  });
};


// Fetch and render the selected Markdown file
const fetchAndRenderMarkdown = async (filePath) => {
  const rawUrl = `https://BagpipesRbetter.github.io/Notes/${filePath}`;
  console.log("Fetching Markdown from:", rawUrl);

  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const markdownText = await response.text();
    markdownViewDiv.innerHTML = marked.parse(markdownText);
  } catch (error) {
    console.error("Error fetching or rendering Markdown:", error);
    markdownViewDiv.textContent =
      "Error loading file content. Check the console for details.";
  }

  window.scrollTo(0, 0);
};

// Load the README.md file initially
const loadReadme = async () => {
  await fetchAndRenderMarkdown("Notes/Docs/README.md");
};

// Initial setup
renderTree();
loadReadme();
fetchLastUpdatedDate();