#!/usr/bin/env python3
"""
Build script for KINGOFJAVA777 multi-language website.
Generates localized HTML pages from template + JSON locale files.

Usage:
    python3 scripts/build-site-locales.py

Output:
    - site/index.html (default language: Russian)
    - site/en.html (English)
    - site/am.html (Armenian)
"""

import json
import os
import re
import sys
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
SITE_DIR = PROJECT_DIR / "site"
TEMPLATE_DIR = SITE_DIR / "templates"
LOCALES_DIR = SITE_DIR / "locales"
OUTPUT_DIR = SITE_DIR

# Language mapping: code -> {filename, lang_attr, dir}
LANGUAGES = {
    "ru": {"file": "index.html", "lang": "ru", "dir": "ltr", "default": True},
    "en": {"file": "en.html", "lang": "en", "dir": "ltr", "default": False},
    "am": {"file": "am.html", "lang": "am", "dir": "ltr", "default": False},
}


def load_locale(lang_code: str) -> dict:
    """Load locale JSON file."""
    locale_path = LOCALES_DIR / f"{lang_code}.json"
    if not locale_path.exists():
        print(f"Warning: Locale file not found: {locale_path}")
        return {}
    
    with open(locale_path, "r", encoding="utf-8") as f:
        return json.load(f)


def flatten_dict(d: dict, parent_key: str = "", sep: str = ".") -> dict:
    """Flatten nested dictionary with dot notation keys."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def translate_content(html: str, translations: dict) -> str:
    """Replace all data-i18n attributes with translated content."""
    
    def replace_i18n(match):
        key = match.group(1)
        return translations.get(key, key)
    
    # Replace content in elements with data-i18n
    pattern = r'data-i18n="([^"]+)"'
    
    # First pass: collect all keys
    keys = re.findall(pattern, html)
    
    # Second pass: replace content
    for key in keys:
        translation = translations.get(key, key)
        # Find the element and replace its content
        # Pattern: <tag ... data-i18n="key">content</tag>
        element_pattern = rf'(<[^>]+data-i18n="{re.escape(key)}"[^>]*>)([^<]*)(</[^>]+>)'
        html = re.sub(element_pattern, rf'\1{translation}\3', html)
    
    return html


def update_html_lang(html: str, lang_code: str, lang_config: dict) -> str:
    """Update html lang attribute and meta tags."""
    # Update lang attribute
    html = re.sub(r'<html\s+lang="[^"]*"', f'<html lang="{lang_config["lang"]}"', html)
    
    # Update dir attribute if needed
    if 'dir="' in html:
        html = re.sub(r'dir="[^"]*"', f'dir="{lang_config["dir"]}"', html)
    else:
        html = html.replace('<html', f'<html dir="{lang_config["dir"]}"')
    
    return html


def update_language_picker(html: str, current_lang: str) -> str:
    """Update language picker to show current language."""
    # Update current language display
    html = re.sub(
        r'<span class="lang-picker__current">[^<]*</span>',
        f'<span class="lang-picker__current">{current_lang.upper()}</span>',
        html
    )
    
    # Update aria-selected attributes
    for lang_code in LANGUAGES.keys():
        selected = "true" if lang_code == current_lang else "false"
        pattern = rf'(data-lang="{lang_code}"[^>]*aria-selected=")[^"]*(")'
        html = re.sub(pattern, rf'\1{selected}\2', html)
    
    return html


def build_page(lang_code: str, template: str, translations: dict) -> str:
    """Build a single localized page."""
    lang_config = LANGUAGES[lang_code]
    
    # Start with template
    html = template
    
    # Update lang attribute
    html = update_html_lang(html, lang_code, lang_config)
    
    # Translate content
    html = translate_content(html, translations)
    
    # Update language picker
    html = update_language_picker(html, lang_code)
    
    return html


def main():
    """Main build process."""
    print("Building KINGOFJAVA777 multi-language website...")
    print(f"Template: {TEMPLATE_DIR / 'index.html'}")
    print(f"Locales: {LOCALES_DIR}")
    print(f"Output: {OUTPUT_DIR}")
    print()
    
    # Load template
    template_path = TEMPLATE_DIR / "index.html"
    if not template_path.exists():
        print(f"Error: Template not found: {template_path}")
        sys.exit(1)
    
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()
    
    # Build each language
    for lang_code, lang_config in LANGUAGES.items():
        print(f"Building {lang_code.upper()}...")
        
        # Load translations
        translations = load_locale(lang_code)
        if not translations:
            print(f"  Warning: No translations for {lang_code}, using template as-is")
            continue
        
        # Flatten nested dict
        flat_translations = flatten_dict(translations)
        print(f"  Loaded {len(flat_translations)} translation keys")
        
        # Build page
        html = build_page(lang_code, template, flat_translations)
        
        # Write output
        output_path = OUTPUT_DIR / lang_config["file"]
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        
        print(f"  ✓ Generated: {output_path}")
    
    print()
    print("Build complete!")


if __name__ == "__main__":
    main()
