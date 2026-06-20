#!/usr/bin/env python3
"""
html_to_md.py — Convert HTML or live URL into clean Markdown.

Engines:
  - default            : html-to-markdown (Goldziher, Rust core, ~150-280 MB/s)
  - markdownify        : matthewwithanm/python-markdownify (fine-grained control)
URL inputs are first run through trafilatura to extract main content
(strip nav/sidebar/ads), then passed to the chosen engine.

Part of huashu-md-html skill — md is source, html is product.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable


HELP_INSTALL = """\
Required packages are missing. Install with:

    pip install html-to-markdown trafilatura markdownify
"""


def ensure_pkgs(*names: str) -> None:
    missing = []
    for n in names:
        try:
            __import__(n)
        except ImportError:
            missing.append(n)
    if missing:
        sys.stderr.write(HELP_INSTALL)
        sys.stderr.write(f"Missing: {', '.join(missing)}\n")
        sys.exit(2)


def is_url(s: str) -> bool:
    return s.startswith(("http://", "https://"))


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Convert HTML or URL to clean Markdown (uses html-to-markdown by default; trafilatura for URLs).",
    )
    p.add_argument(
        "source",
        help="Local .html file path or URL (http(s)://...).",
    )
    p.add_argument(
        "-o", "--output",
        help="Output .md path (defaults to <source-stem>.md, or 'fetched.md' for URLs); use '-' for stdout.",
    )
    p.add_argument(
        "--engine",
        choices=("auto", "html-to-markdown", "markdownify"),
        default="auto",
        help="Conversion engine (auto = html-to-markdown).",
    )
    p.add_argument(
        "--no-extract",
        action="store_true",
        help="Skip trafilatura main-content extraction even on URLs (use raw HTML).",
    )
    p.add_argument(
        "--strip",
        default="script,style,nav,footer,aside,iframe,form",
        help="Comma-separated list of HTML tags to strip (markdownify engine only).",
    )
    p.add_argument(
        "--bullets",
        default="-",
        help="Bullet character for unordered lists (markdownify engine only). Default: '-'.",
    )
    p.add_argument(
        "--heading-style",
        default="atx",
        choices=("atx", "atx_closed", "setext", "underlined"),
        help="Heading style (markdownify engine only). Default: atx (i.e., # / ## / ###).",
    )
    p.add_argument(
        "--user-agent",
        default="Mozilla/5.0 (huashu-md-html/0.1)",
        help="User-Agent for URL fetches.",
    )
    p.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress non-error stderr output.",
    )
    return p.parse_args()


def fetch_url(url: str, ua: str) -> str:
    import urllib.request
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310 — explicit user input
        raw = resp.read()
        # Best-effort decode using charset hint or utf-8
        charset = resp.headers.get_content_charset() or "utf-8"
        return raw.decode(charset, errors="replace")


def trafilatura_extract(html: str, url_hint: str | None) -> str | None:
    """Try to extract clean main content. Returns None if extraction yields nothing."""
    try:
        import trafilatura
    except ImportError:
        return None
    extracted = trafilatura.extract(
        html,
        url=url_hint,
        output_format="html",
        include_comments=False,
        include_tables=True,
        favor_recall=False,
    )
    return extracted or None


def convert_with_html_to_markdown(html: str) -> str:
    from html_to_markdown import convert
    result = convert(html)
    # Library returns a dataclass-like result with .content
    return getattr(result, "content", result if isinstance(result, str) else "")


def convert_with_markdownify(html: str, strip: Iterable[str], bullets: str, heading_style: str) -> str:
    from markdownify import markdownify
    return markdownify(
        html,
        heading_style=heading_style,
        bullets=bullets,
        strip=[s.strip() for s in strip if s.strip()],
    )


def resolve_output_path(source: str, output: str | None) -> Path | None:
    if output == "-":
        return None
    if output:
        return Path(output)
    if is_url(source):
        return Path("fetched.md")
    return Path(Path(source).stem + ".md")


def main() -> int:
    args = parse_args()

    # Engine resolution
    engine = args.engine
    if engine == "auto":
        engine = "html-to-markdown"

    if engine == "html-to-markdown":
        ensure_pkgs("html_to_markdown")
    elif engine == "markdownify":
        ensure_pkgs("markdownify")

    # Load HTML
    if is_url(args.source):
        ensure_pkgs("trafilatura") if not args.no_extract else None
        html = fetch_url(args.source, args.user_agent)
    else:
        path = Path(args.source)
        if not path.exists():
            sys.stderr.write(f"[error] file not found: {path}\n")
            return 1
        html = path.read_text(encoding="utf-8")

    # Extract main content for URLs
    cleaned_html = html
    if is_url(args.source) and not args.no_extract:
        extracted = trafilatura_extract(html, args.source)
        if extracted:
            cleaned_html = extracted
        elif not args.quiet:
            sys.stderr.write(
                "[hint] trafilatura found no main content; falling back to raw HTML.\n",
            )

    # Convert
    if engine == "html-to-markdown":
        md = convert_with_html_to_markdown(cleaned_html)
    else:
        strip = args.strip.split(",")
        md = convert_with_markdownify(cleaned_html, strip, args.bullets, args.heading_style)

    if not md.strip():
        sys.stderr.write(
            "[error] conversion produced empty markdown. "
            "Try --no-extract (for URLs) or --engine=markdownify.\n",
        )
        return 1

    out_path = resolve_output_path(args.source, args.output)
    if out_path is None:
        sys.stdout.write(md)
    else:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(md, encoding="utf-8")
        if not args.quiet:
            sys.stderr.write(f"[ok] {args.source} → {out_path} (engine: {engine})\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
