const buildTreeData = async (url) => {
    const response = await fetch(url);
    const files = await response.json();
    const treeData = [];

    for (let file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
            treeData.push({ title: file.name, path: file.path, icon: "file" });
        } else if (file.type === 'file' && /\.(jpg|jpeg|png|gif|svg)$/i.test(file.name)) {
            treeData.push({ title: file.name, path: file.path, icon: "image" });
        } else if (file.type === 'dir') {
            treeData.push({ title: file.name, folder: true, children: await buildTreeData(file.url) });
        }
    }

    return treeData;
};

const renderTree = async () => {
    const treeData = await buildTreeData(apiUrl);

    // Initialize FancyTree
    $("#file-tree").fancytree({
        source: treeData,
        click: async function(event, data) {
            if (!data.node.folder) {
                await fetchAndRenderMarkdown(data.node.data.path);
            }
        }
    });
};
