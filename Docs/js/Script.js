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
// Fetch README.md
async function fetchAndRenderMarkdown(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error("Network response was not ok");
      }
      const markdown = await response.text();
      document.getElementById('markdown-view').textContent = markdown;
  } catch (error) {
      console.error("Error fetching or rendering Markdown:", error);
  }
}

// Load README.md from the correct location
function loadReadme() {
  const readmeUrl = 'https://bagpipesrbetter.github.io/Notes/Docs/README.md'; // Ensure path is correct
  fetchAndRenderMarkdown(readmeUrl);
}

loadReadme();

// FancyTree initialization
$("#file-tree").fancytree({
  extensions: [],
  source: [ /* file tree data */ ],
  clickFolderMode: 2,
  init: function(event, data) {
      data.tree.visit(function(node) {
          node.setExpanded(true); // Expand all nodes statically
      });
  }
});


// Initial setup
renderTree();
loadReadme();
fetchLastUpdatedDate();