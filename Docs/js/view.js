async function loadMarkdownFile() {
  try {
    // Fetch the raw markdown file from your GitHub repository
    const response = await fetch(
      "https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/main/path/to/yourfile.md"
    );

    // Check if the request was successful
    if (!response.ok) {
      throw new Error("Failed to load file");
    }

    // Get the file content as text
    const markdown = await response.text();

    // Use Marked.js to convert markdown to HTML
    const htmlContent = marked(markdown);

    // Display the formatted HTML inside the div
    document.getElementById("content").innerHTML = htmlContent;
  } catch (error) {
    document.getElementById("content").innerHTML =
      "Error loading markdown file.";
    console.error(error);
  }
}

// Load the markdown file on page load
loadMarkdownFile();
