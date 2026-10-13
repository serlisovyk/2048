# The link preview also has `og:site_name` and the `twitter:*` twins

Date: 2026-10-13 · Status: accepted · Refines `2026-10-12-og-preview-image.md`

## Context

After MY-131 went live, Vercel's link preview check listed `og:site_name`, `twitter:title`,
`twitter:description` and `twitter:image` as missing (MY-136). MY-131 had left the
`twitter:*` tags out on purpose: X falls back to `og:*`, so they change nothing on X.
`og:site_name` is different: Telegram, Slack and Discord show it above the card.

## Decision

- Add `og:site_name` = `2048`.
- Add `twitter:title`, `twitter:description` and `twitter:image` with the same values as
  `og:title`, `og:description` and `og:image`. The author chose a clean report from the
  preview checkers over three lines of duplication.

## Consequences

- Each `twitter:*` tag must stay equal to its `og:*` twin; `ai/rules/assets-performance.md`
  and `ai/map.md` say so.
- About 150 bytes more HTML before gzip.
