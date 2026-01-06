from main import scrape_web_content

# Test the scrape_web function with minsearch GitHub repo
test_url = "https://github.com/alexeygrigorev/minsearch"
print(f"Testing scrape_web with: {test_url}")
print("=" * 80)

try:
    content = scrape_web_content(test_url)
    print(f"Successfully scraped content!")
    print(f"Content length: {len(content)} characters")
    print("\nFirst 500 characters:")
    print("=" * 80)
    print(content[:500])
    print("=" * 80)
    print("\nLast 500 characters:")
    print("=" * 80)
    print(content[-500:])
except Exception as e:
    print(f"Error: {e}")