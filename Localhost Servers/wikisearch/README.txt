# Python Wiki Server
Overview
This is a Python server which interacts with Wikipedia'scale API to fetch summaries and categories of articles related to a keyword. This server is meant to be run locally and serves as a helper for the ChrysalIDE application.

# Getting Started
Requirements
Python 3.6 or above
Pip (Python Package Installer), usually installed with Python
# Installing Dependencies
All the Python library dependencies are listed in the requirements.txt file. To install these dependencies, navigate to the directory containing requirements.txt file and run the following command:


pip install -r requirements.txt
Running the Server
To start the server, navigate to the directory containing the app.py file (or whatever you named your python file) and run the following command:


python app.py
The server will start running on localhost:5000.

# Usage
Once the server is running, it can accept GET requests at the endpoint /wikipedia_summaries. The request parameters include:

keyword: The keyword to search on Wikipedia.
top_n_links: The number of top articles to fetch (default is 2).
srwhat: Search type for Wikipedia'scale API (default is None).
srsort: Sorting method for Wikipedia'scale search results (default is 'relevance').
exsentences: Number of sentences to extract from the summary (default is 3).
top_exsentences: Number of sentences to extract from the summary of the top article (default is 6).
top_n_categories: Number of top categories to fetch for each article (default is 5).
Troubleshooting
If you encounter any issues while setting up or running the server, please check if you've followed all the instructions correctly. If the problem persists, feel free to open an issue on this repository.
