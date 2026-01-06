import sys
from jina import Flow
from jina import DocumentArray
from markdownify import markdownify as md

def fetch_webpage_content(url: str) -> str:
    """Fetch webpage content using Jina."""
    flow = Flow().add(uses='jinahub://WebReader')
    with flow:
        result = flow.post(on='/read', inputs={'url': url}, return_results=True)
        doc_array = DocumentArray(result)  # Convert result to DocumentArray
    return doc_array[0].text  # Access the first document's text

def convert_to_markdown(html_content: str) -> str:
    """Convert HTML content to Markdown."""
    return md(html_content)

def count_characters(content: str) -> int:
    """Count the number of characters in the given content."""
    return len(content)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python webpage_to_markdown.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    html_content = fetch_webpage_content(url)
    markdown_content = convert_to_markdown(html_content)

    with open("output.md", "w") as f:
        f.write(markdown_content)

    print("Markdown content saved to output.md")
