from fastmcp import FastMCP
import requests

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

def scrape_web_content(url: str) -> str:
    """
    Scrape the content of any web page and return it as markdown.

    Args:
        url: The URL of the web page to scrape

    Returns:
        The content of the web page in markdown format
    """
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    return response.text

@mcp.tool
def scrape_web(url: str) -> str:
    """
    Scrape the content of any web page and return it as markdown.

    Args:
        url: The URL of the web page to scrape

    Returns:
        The content of the web page in markdown format
    """
    return scrape_web_content(url)

@mcp.tool
def count_word_in_url(url: str, word: str) -> dict:
    """
    Count how many times a specific word appears in a web page.

    Args:
        url: The URL of the web page to analyze
        word: The word to count (case-insensitive)

    Returns:
        A dictionary with the count and additional information
    """
    content = scrape_web_content(url)
    # Convert to lowercase for case-insensitive matching
    content_lower = content.lower()
    word_lower = word.lower()
    count = content_lower.count(word_lower)

    return {
        "url": url,
        "word": word,
        "count": count,
        "content_length": len(content)
    }

if __name__ == "__main__":
    mcp.run()