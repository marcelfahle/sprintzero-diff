# Publish Deliverable to diff.sprintzero.sh

## Triggers

- "publish deliverable"
- "create diff"
- "share engagement report"
- "publish to diff"

## Overview

This skill publishes a client engagement deliverable as a secret GitHub Gist and registers it in diff.sprintzero.sh so it's accessible via a clean URL like `diff.sprintzero.sh/{customer}` or `diff.sprintzero.sh/{customer}/{project}`.

## Prerequisites

- `gh` CLI authenticated with gist permissions
- The diff.sprintzero.sh project checked out (for updating `deliverables.json`)
- The site deployed to Vercel (for cache warming)

## Workflow

### Step 1: Prepare deliverable files

Start from the templates in the `templates/` directory at the project root:

```
templates/README.md      — Executive summary (always required)
templates/TECHNICAL.md   — Architecture and migration details
templates/SECURITY.md    — Vulnerability assessment and remediations
templates/TESTING.md     — Test coverage and E2E results
templates/AI-SETUP.md    — AI tooling and workflow setup
```

Replace all `{{PLACEHOLDER}}` values with real engagement data. Not all files are required — include only what's relevant to the engagement. README.md is always required.

**Frontmatter fields** (in README.md):

| Field | Required | Example |
|-------|----------|---------|
| `client` | Yes | `"Encappture"` |
| `engagement` | Yes | `"CMS React Modernization"` |
| `delivered` | Yes | `"March 2026"` |
| `sprint_duration` | No | `"3 weeks"` |
| `lead` | No | `"Marcel Fahle"` |
| `status` | Yes | `"Complete"` |

**GFM alert conventions:**

- `> [!NOTE]` — Informational callouts, key metrics tables
- `> [!TIP]` — Recommendations, helpful suggestions
- `> [!IMPORTANT]` — Critical outcomes, sprint completion
- `> [!WARNING]` — Deferred work, known limitations
- `> [!CAUTION]` — Remaining risks, unresolved issues

### Step 2: Create a secret GitHub Gist

Always create **secret** gists (never public). Always include a description with the `-d` flag.

```bash
gh gist create README.md TECHNICAL.md SECURITY.md TESTING.md AI-SETUP.md \
  -d '{Customer} · {Engagement Name} · {Month Year}'
```

The description format is: `{Customer} · {Engagement Name} · {Month Year}`

Example:
```bash
gh gist create README.md TECHNICAL.md SECURITY.md \
  -d 'Encappture · CMS React Modernization · March 2026'
```

Capture the gist URL from the output. Extract the gist ID (the hex string at the end of the URL).

### Step 3: Update the deliverables registry

Edit `deliverables.json` at the project root. Add or update the customer entry:

```json
{
  "customer-slug": {
    "name": "Customer Display Name",
    "default": "project-slug",
    "projects": {
      "project-slug": {
        "gistId": "abc123def456...",
        "name": "Project Display Name",
        "date": "2026-03"
      }
    }
  }
}
```

**Slug conventions:**
- Customer slug: lowercase kebab-case company name (e.g., `encappture`, `acme-corp`)
- Project slug: lowercase kebab-case project name (e.g., `cms-modernization`, `api-redesign`)
- The `default` field points to the project slug that resolves when only the customer slug is used in the URL
- `date` format: `YYYY-MM`

### Step 4: Commit and push

```bash
git add deliverables.json
git commit -m 'feat: add {customer}/{project} deliverable'
git push
```

Only stage `deliverables.json`. Do not stage template files or other changes.

### Step 5: Warm the cache

After Vercel deploys the updated registry, warm the cache by visiting the deliverable URL:

```bash
curl -s https://diff.sprintzero.sh/{customer-slug}
```

This triggers Next.js ISR to fetch and cache the gist content.

### Step 6: Present the URL

Share the clean URL with the client:

```
https://diff.sprintzero.sh/{customer-slug}
```

Or the project-specific URL if the customer has multiple projects:

```
https://diff.sprintzero.sh/{customer-slug}/{project-slug}
```

## Rules

1. **Always secret** — Never create public gists. Client deliverables are confidential.
2. **Always use `-d`** — Every gist must have a description following the format `{Customer} · {Engagement Name} · {Month Year}`.
3. **Always warm cache** — After pushing the registry update, curl the deliverable URL to warm the ISR cache.
4. **Always update registry** — Every deliverable must be registered in `deliverables.json` for clean URL access.
5. **README.md is required** — Every deliverable must include at least a README.md with frontmatter.
6. **Use GFM alerts** — Structure content with GitHub-Flavored Markdown alerts for visual hierarchy.
7. **Keep slugs kebab-case** — Both customer and project slugs must be lowercase kebab-case.

## URL Reference

| URL Pattern | Resolves To |
|-------------|------------|
| `diff.sprintzero.sh/{customer}` | Default project for that customer |
| `diff.sprintzero.sh/{customer}/{project}` | Specific project |
| `diff.sprintzero.sh/{hex-gist-id}` | Direct gist access (dev/debug) |

## Updating an existing deliverable

To update content in an existing deliverable:

```bash
gh gist edit {gist-id}
```

Then bust the cache:

```bash
curl -s -X POST https://diff.sprintzero.sh/api/refresh/{gist-id}
```

No registry update needed — the gist ID hasn't changed.
