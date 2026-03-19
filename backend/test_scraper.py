#!/usr/bin/env python3
"""
Test script for the scholarship scraper.
This script can be used to test the scraper functionality in the cloud environment.
"""

import os
import sys
import logging
from app.schemas.scraping import WebsiteSource
from app.utils.scraper import scrape_scholarships, get_driver, cleanup_driver

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_scraper():
    """Test the scraper functionality."""
    try:
        # Test Chromium driver creation
        logger.info("Testing Chromium driver creation...")
        driver = get_driver()
        if driver:
            logger.info("✅ Chromium driver created successfully")
        else:
            logger.error("❌ Failed to create Chromium driver")
            return False

        # Test scraping with a sample source
        logger.info("Testing scraping functionality...")
        source = WebsiteSource(
            url="https://brightsparks.com.sg/searchScholarships.php",
            name="BrightSparks Singapore",
            scholarship_element_selector=".col-span-11.movie",
            name_selector="h4 a span#getUpdatedTitle",
            description_selector=".detail dd",
            amount_selector=None,
            deadline_selector=".caption-deadline h6",
            deadline_format="%d %b %Y",
            category_selector=None,
            country_selector="singapore",
            tags_selector=None
        )

        # Run scraping (this will test the full pipeline)
        result = scrape_scholarships(source)
        logger.info(f"✅ Scraping completed. {result} scholarships processed")

        return True

    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        return False
    finally:
        cleanup_driver()


if __name__ == "__main__":
    success = test_scraper()
    sys.exit(0 if success else 1)
