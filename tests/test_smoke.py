"""Smoke tests — portfolio HTML/CSS verification."""
from pathlib import Path


def test_html_present():
    """index.html must exist and be valid HTML."""
    html = Path("index.html")
    assert html.exists(), "index.html not found"
    content = html.read_text()
    assert "<!DOCTYPE html>" in content or "<!doctype html>" in content
    assert "</html>" in content


def test_css_present():
    """style.css must exist."""
    assert Path("style.css").exists(), "style.css not found"


def test_js_present():
    """script.js must exist."""
    assert Path("script.js").exists(), "script.js not found"
