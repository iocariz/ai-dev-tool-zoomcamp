import zipfile
import os
from pathlib import Path
import minsearch

def extract_and_index_docs(zip_path="fastmcp-main.zip"):
    """
    Extract documentation files from zip and index them with minsearch.

    Returns:
        minsearch.Index: The indexed documentation
    """
    documents = []

    # Open the zip file
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Get all file names in the zip
        file_list = zip_ref.namelist()

        # Filter for .md and .mdx files
        doc_files = [f for f in file_list if f.endswith('.md') or f.endswith('.mdx')]

        print(f"Found {len(doc_files)} documentation files")

        for file_path in doc_files:
            # Read the file content
            with zip_ref.open(file_path) as file:
                content = file.read().decode('utf-8')

            # Remove the first part of the path (fastmcp-main/)
            # Split by '/' and remove the first part
            path_parts = file_path.split('/')
            if len(path_parts) > 1:
                cleaned_filename = '/'.join(path_parts[1:])
            else:
                cleaned_filename = file_path

            # Create document dict
            doc = {
                'filename': cleaned_filename,
                'content': content
            }
            documents.append(doc)
            print(f"Indexed: {cleaned_filename}")

    # Create and fit the index
    index = minsearch.Index(
        text_fields=['content', 'filename'],
        keyword_fields=[]
    )

    index.fit(documents)
    print(f"\nIndexing complete! Total documents: {len(documents)}")

    return index

def search_docs(index, query, num_results=5):
    """
    Search the documentation index.

    Args:
        index: The minsearch Index object
        query: Search query string
        num_results: Number of results to return (default: 5)

    Returns:
        list: Top matching documents
    """
    results = index.search(
        query=query,
        filter_dict={},
        boost_dict={},
        num_results=num_results
    )
    return results