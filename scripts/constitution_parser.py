"""parser.py - Parses a PDF document to extract the Constitution's articles and store them in memory.
"""
import logging
import re

import slate  # pylint: disable=import-error


logging.basicConfig(level=logging.INFO)


class Document:
    """Class for Regulations Documents"""

    def __init__(self, jurisdiction, shahash, url, last_updated):
        self.id = None
        self.jurisdiction = jurisdiction
        self.shahash = shahash
        self.url = url
        self.last_updated = last_updated

    def __repr__(self):
        return f"Document(\
                id={self.id}, \
                jurisdiction={self.jurisdiction}, \
                last_updated={self.last_updated}, \
                url={self.url}, \
                shahash={self.shahash}\
            )"


class Article:
    """Class for storing articles.
    """

    def __init__(self, number, content):
        self.number = number
        self.content = content
        self.id = str(number)

    def to_dict(self):
        article_dict = {
            "number": self.number,
            "id": self.id,
            "content": self.content,
            "wordCount": len(self.content.split())
        }
        return article_dict


def identify_articles(pdf_text):
    """Identifies articles and returns a list of Article objects.

    Args:
        pdf_text (string): contains the PDF text where articles
        are to be identified.

    Returns:
        list: article objects
    """
    articles = []
    i = 1
    res = re.split(r'Art[íi]culo *\d+ *o? *\.', pdf_text)
    while i < len(res):
        articles.append(Article(i, res[i].strip()))
        logging.info("Article #" + str(i) + " recognized!")
        i += 1
    return articles


if __name__ == "__main__":
    file_name = "./CPEUM.pdf"
    with open(file_name, "rb") as pdf_file:
        doc = slate.PDF(pdf_file)
        final_text = ""
        for page in doc:
            final_text += page
        articles = identify_articles(final_text)

        for article in articles:
            dictionary = article.to_dict()
            # Store it in the DB?
