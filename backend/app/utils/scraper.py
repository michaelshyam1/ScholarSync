import logging
import re
import time
from bs4 import BeautifulSoup, Tag
from datetime import datetime
from typing import List, Optional
from urllib.parse import urljoin, urlparse, unquote
import os
import threading

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.scholarship import Scholarship
from app.schemas.scraping import WebsiteSource

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global driver instance
_driver = None

# Global lock for scraping
_scraping_lock = threading.Lock()


def get_driver():
    """Get or create a Chrome driver instance."""
    global _driver
    if _driver is None:
        options = Options()
        # Headless mode for cloud deployment
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-software-rasterizer")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-logging")
        options.add_argument("--disable-web-security")
        options.add_argument("--allow-running-insecure-content")
        options.add_argument("--remote-debugging-port=9222")
        options.add_argument("--user-data-dir=/tmp/chrome-user-data")
        options.add_argument("--data-path=/tmp/chrome-data")
        options.add_argument("--homedir=/tmp")
        options.add_argument("--disk-cache-dir=/tmp/cache-dir")
        options.add_argument("--single-process")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-background-timer-throttling")
        options.add_argument("--disable-backgrounding-occluded-windows")
        options.add_argument("--disable-renderer-backgrounding")
        options.add_argument("--disable-features=TranslateUI")
        options.add_argument("--disable-ipc-flooding-protection")
        options.add_argument("--disable-default-apps")
        options.add_argument("--disable-sync")
        options.add_argument("--no-first-run")
        options.add_argument("--no-default-browser-check")
        options.add_argument("--disable-component-update")
        options.add_argument("--disable-domain-reliability")
        options.add_argument("--disable-features=VizDisplayCompositor")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        options.add_experimental_option(
            "excludeSwitches", ["enable-automation", "enable-logging"])
        options.add_experimental_option('useAutomationExtension', False)

        try:
            if _driver:
                try:
                    _driver.quit()
                except:
                    pass

            # Use ChromeDriver from the path where it's installed in the Docker container
            driver_path = "/usr/local/bin/chromedriver"
            logger.info(f"Using ChromeDriver at: {driver_path}")

            _driver = webdriver.Chrome(
                service=Service(driver_path), options=options)
            _driver.set_page_load_timeout(30)
            _driver.implicitly_wait(10)
            logger.info("Chrome driver created successfully")
        except Exception as e:
            logger.error(f"Failed to create Chrome driver: {str(e)}")
            raise
    return _driver


def cleanup_driver():
    """Clean up the Chrome driver instance."""
    global _driver
    if _driver:
        try:
            _driver.quit()
        except Exception as e:
            logger.warning(f"Error closing driver: {str(e)}")
        finally:
            _driver = None


def fetch_rendered_html(url, max_retries=3):
    """Use Selenium to render and return HTML of a page with retries."""
    driver = get_driver()
    retry_count = 0

    while retry_count < max_retries:
        try:
            driver.get(url)

            # Wait for either scholarship cards or any error message
            wait = WebDriverWait(driver, 20)
            scholarship_present = EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".col-span-11.movie"))

            # Wait for content to load
            wait.until(scholarship_present)

            # Scroll slowly to handle lazy loading
            total_height = int(driver.execute_script(
                "return document.body.scrollHeight"))
            for i in range(1, total_height, 100):
                driver.execute_script(f"window.scrollTo(0, {i});")
                time.sleep(0.1)

            return driver.page_source

        except TimeoutException:
            retry_count += 1
            logger.warning(
                f"Timeout waiting for content (attempt {retry_count}/{max_retries})")
            if retry_count == max_retries:
                logger.error(
                    f"Failed to load content after {max_retries} attempts")
                return driver.page_source
            time.sleep(2 * retry_count)  # Exponential backoff

        except WebDriverException as e:
            retry_count += 1
            logger.warning(
                f"WebDriver error (attempt {retry_count}/{max_retries}): {str(e)}")
            if retry_count == max_retries:
                logger.error("Failed to recover from WebDriver error")
                cleanup_driver()  # Reset the driver on error
                raise
            time.sleep(2 * retry_count)


def expand_all_accordions(driver):
    """Click all accordion headers to expand content."""
    headings = driver.find_elements(
        By.CSS_SELECTOR, "div.accordion-heading a.accordion-toggle")
    for heading in headings:
        try:
            if "collapsed" in heading.get_attribute("class"):
                driver.execute_script("arguments[0].click();", heading)
        except Exception as e:
            logger.warning(f"Could not expand accordion: {e}")


def get_rendered_html(url):
    """Use Selenium to render and return HTML of a page."""
    options = Options()
    # Headless mode for cloud deployment
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-logging")
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--remote-debugging-port=9222")
    options.add_argument("--user-data-dir=/tmp/chrome-user-data")
    options.add_argument("--data-path=/tmp/chrome-data")
    options.add_argument("--homedir=/tmp")
    options.add_argument("--disk-cache-dir=/tmp/cache-dir")
    options.add_argument("--single-process")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-features=TranslateUI")
    options.add_argument("--disable-ipc-flooding-protection")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-sync")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-component-update")
    options.add_argument("--disable-domain-reliability")
    options.add_argument("--disable-features=VizDisplayCompositor")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)

    # Use ChromeDriver from the path where it's installed in the Docker container
    driver_path = "/usr/local/bin/chromedriver"
    logger.info(f"Using ChromeDriver at: {driver_path}")

    driver = webdriver.Chrome(service=Service(driver_path), options=options)
    driver.get(url)

    try:
        # Increase wait time and add multiple wait conditions
        wait = WebDriverWait(driver, 30)

        # Wait for either scholarship cards or any error message
        scholarship_present = EC.presence_of_element_located(
            (By.CSS_SELECTOR, ".col-span-11.movie"))

        wait.until(scholarship_present)

        # Scroll slowly to handle lazy loading
        total_height = int(driver.execute_script(
            "return document.body.scrollHeight"))
        for i in range(1, total_height, 100):
            driver.execute_script(f"window.scrollTo(0, {i});")
            time.sleep(0.1)

        time.sleep(2)  # Final wait for any last dynamic content

    except Exception as e:
        logger.warning(f"Timeout or error waiting for scholarships: {str(e)}")
    finally:
        html = driver.page_source
        driver.quit()
        return html


def extract_tags(description, vectorizer, top_n=5):
    """Extract tags from description using TF-IDF."""
    if not description:
        return []
    try:
        tfidf_matrix = vectorizer.transform([description])
        feature_array = np.array(vectorizer.get_feature_names_out())
        tfidf_sorting = np.argsort(tfidf_matrix.toarray()).flatten()[::-1]
        top_n_words = feature_array[tfidf_sorting][:top_n]
        return list(top_n_words)
    except Exception as e:
        logger.warning(f"Error extracting tags: {str(e)}")
        return []


def _parse_date(date_str: Optional[str], deadline_format: Optional[str] = None) -> Optional[datetime]:
    """Parse date string to datetime object. Supports:
    - '31 July 2025, Thursday.'
    - '31 July 2025'
    - '9 Aug 2025, Sat'
    - '9 Aug 2025'
    """
    if not date_str:
        return None

    try:
        # Handle special cases
        special_cases = ['Closed for this cycle',
                         'Closed', 'TBA', 'N/A', 'Ongoing']
        if any(case.lower() in date_str.lower() for case in special_cases):
            return None

        # Remove day-of-week if present (e.g., ', Thursday.')
        if ',' in date_str:
            date_str = date_str.split(',')[0].strip()

        # Remove trailing punctuation and whitespace
        date_str = date_str.rstrip('.').strip()

        # Try both abbreviated and full month names
        for fmt in ("%d %b %Y", "%d %B %Y"):
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        logger.warning(f"Could not parse date: {date_str}")
        return None

    except Exception as e:
        logger.warning(f"Error parsing date {date_str}: {str(e)}")
        return None


def scrape_scholarships(source):
    """Main scraping function that uses a single driver instance."""
    # Try to acquire the lock, return immediately if already locked
    if not _scraping_lock.acquire(blocking=False):
        logger.warning("Another scraping task is already running. Skipping.")
        return 0

    scholarships_added = 0
    db = SessionLocal()
    try:
        html = fetch_rendered_html(source.url)
        if not html:
            logger.error("Failed to fetch HTML content")
            return scholarships_added

        soup = BeautifulSoup(html, 'html.parser')
        scholarship_elements = soup.select(source.scholarship_element_selector)

        if not scholarship_elements:
            logger.warning(f"No scholarship elements found on {source.url}")
            return scholarships_added

        logger.info(
            f"Found {len(scholarship_elements)} scholarship elements on {source.url}")

        base_url = str(source.url)
        if isinstance(base_url, list):
            base_url = base_url[0]

        descriptions = []
        scholarships_data = []

        for element in scholarship_elements:
            try:
                # Extract title
                title_elem = element.select_one('span#getUpdatedTitle')
                title = title_elem.get_text(strip=True) if title_elem else None

                # Extract description
                description_elem = element.select_one('div.detail dd')
                description = description_elem.get_text(
                    strip=True) if description_elem else None

                # Extract deadline
                deadline_elem = element.select_one('.caption-deadline h6')
                deadline_text = None
                status = 'open'
                if deadline_elem:
                    lines = [line.strip()
                             for line in deadline_elem.stripped_strings]
                    for line in lines:
                        if line.lower().startswith('deadline'):
                            continue
                        if line:
                            deadline_text = line
                            break
                    if deadline_text and 'closed for this cycle' in deadline_text.lower():
                        status = 'Closed'

                # Extract URL
                detail_link_elem = element.select_one('div.view-btn a')
                detail_url = None
                if detail_link_elem and detail_link_elem.has_attr('href'):
                    href = detail_link_elem['href']
                    if isinstance(href, list):
                        href = href[0]
                    detail_url = urljoin(base_url, str(href))

                logger.info(
                    f"Processing scholarship: title={title}, url={detail_url}")
                if not title or not detail_url:
                    logger.warning("Missing title or URL, skipping.")
                    continue

                # Set default values
                image_url = 'https://media.istockphoto.com/id/1969854514/photo/graduation-cap-books-and-laptop-or-university-education-for-future-goal-scholarship-or-online.jpg?s=2048x2048&w=is&k=20&c=Y-khhh9enQh2fY7GobDjJOYsvlYTDLkDuS4KliWhrro='

                # Instead of creating and saving Scholarship here, collect data:
                scholarships_data.append({
                    "title": title,
                    "description": description,
                    "scholarship_amount": None,
                    "scholarship_deadline": _parse_date(deadline_text, source.deadline_format),
                    "scholarship_url": detail_url,
                    "scholarship_category": [],
                    "scholarship_country": "Singapore",
                    "scholarship_min_gpa": None,
                    "scholarship_min_education_level": None,
                    "scholarship_gender_looking_for": "Any",
                    "scholarship_max_age": None,
                    "scholarship_image": image_url,
                    "scholarship_status": status,
                    "tags": [],
                    "recommended": False
                })
                descriptions.append(description or "")

            except Exception as e:
                logger.error(f"Error processing scholarship element: {str(e)}")
                continue

        # Fit TF-IDF vectorizer on all descriptions
        if descriptions:
            try:
                vectorizer = TfidfVectorizer(
                    stop_words='english', max_features=1000)
                vectorizer.fit(descriptions)

                # Now, for each scholarship, extract tags and save to DB
                for data in scholarships_data:
                    try:
                        tags = extract_tags(
                            data["description"], vectorizer, top_n=5)
                        scholarship = Scholarship(
                            scholarship_name=data["title"],
                            scholarship_description=data["description"],
                            scholarship_amount=data["scholarship_amount"],
                            scholarship_deadline=data["scholarship_deadline"],
                            scholarship_url=data["scholarship_url"],
                            scholarship_category=data["scholarship_category"],
                            scholarship_country=data["scholarship_country"],
                            scholarship_min_gpa=data["scholarship_min_gpa"],
                            scholarship_min_education_level=data["scholarship_min_education_level"],
                            scholarship_gender_looking_for=data["scholarship_gender_looking_for"],
                            scholarship_max_age=data["scholarship_max_age"],
                            scholarship_image=data["scholarship_image"],
                            scholarship_status=data["scholarship_status"],
                            tags=tags,
                            recommended=data["recommended"]
                        )
                        db.add(scholarship)
                        db.commit()
                        scholarships_added += 1
                        logger.info(f"Added new scholarship: {data['title']}")
                    except Exception as e:
                        logger.error(
                            f"Error saving scholarship {data.get('title', 'Unknown')}: {str(e)}")
                        db.rollback()
                        continue
            except Exception as e:
                logger.error(f"Error with TF-IDF processing: {str(e)}")

        logger.info(
            f"Scraping completed. {scholarships_added} new scholarships added.")
        return scholarships_added

    except Exception as e:
        logger.error(f"Error during scraping: {str(e)}")
        return scholarships_added
    finally:
        cleanup_driver()
        db.close()
        _scraping_lock.release()  # Always release the lock


def extract_scholarship_from_soup(soup, selectors):
    """
    Extract scholarship data from a BeautifulSoup object using provided selectors.
    selectors: dict with keys like 'title', 'description', 'deadline', 'provider', etc.
    Returns a dict of extracted fields.
    """
    # Try multiple selectors for title
    title = None
    title_selectors = [
        selectors.get('title', 'span#getUpdatedTitle'),
        'h4 a span#getUpdatedTitle',  # Alternative selector
        'h4 a',  # Fallback to link text
        '.scholarship-title',  # Another common class
    ]

    for selector in title_selectors:
        title_elem = soup.select_one(selector)
        if title_elem:
            title = title_elem.get_text(strip=True)
            if title:
                break

    # If still no title, try to extract from URL
    if not title and 'scholarship_url' in selectors:
        parsed = urlparse(selectors['scholarship_url'])
        path = unquote(parsed.path)
        # Extract last part of path before .php
        title = path.split('/')[-1].replace('.php',
                                            '').replace('-', ' ').title()

    # Description
    description_elem = soup.select_one(
        selectors.get('description', 'div.detail dd'))
    description = description_elem.get_text(
        strip=True) if description_elem else None

    # Deadline
    deadline_elem = soup.select_one(
        selectors.get('deadline', '.caption-deadline h6'))
    deadline = None
    status = 'open'
    if deadline_elem:
        lines = [line.strip() for line in deadline_elem.stripped_strings]
        for line in lines:
            if line.lower().startswith('deadline'):
                continue
            if line:
                deadline = line
                break
        if deadline and 'closed for this cycle' in deadline.lower():
            status = 'Closed'
        else:
            status = 'open'

    # Set defaults for unused fields
    image_url = 'https://media.istockphoto.com/id/1969854514/photo/graduation-cap-books-and-laptop-or-university-education-for-future-goal-scholarship-or-online.jpg?s=2048x2048&w=is&k=20&c=Y-khhh9enQh2fY7GobDjJOYsvlYTDLkDuS4KliWhrro='
    gender = 'Any'

    return {
        'scholarship_name': title,
        'scholarship_description': description,
        'scholarship_amount': None,
        'scholarship_deadline': None,
        'scholarship_url': None,  # Should be set by caller
        'scholarship_category': [],
        'scholarship_country': None,
        'scholarship_min_gpa': None,
        'scholarship_min_education_level': None,
        'scholarship_gender_looking_for': gender,
        'scholarship_max_age': None,
        'scholarship_image': image_url,
        'scholarship_status': status,
        'tags': [],
        'recommended': False
    }
