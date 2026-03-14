# Create Client Deliverable

## Triggers

- "create deliverable"
- "new deliverable"
- "set up deliverable"
- "deliverable for {customer}"

## Overview

Interactive skill that gathers project information, pulls PR details, and creates a polished client deliverable as a GitHub Gist — registered and ready to share at `diff.sprintzero.sh/{slug}`.

The deliverable follows the Sprint Zero format: executive summary on the first tab, one tab per PR or milestone, smart brevity throughout. Designed so a CEO can scan it in 30 seconds and a developer can use it as a reference.

## Prerequisites

- `gh` CLI authenticated with gist and repo read permissions
- The diff.sprintzero.sh project checked out
- Access to the client's GitHub repos (for PR details)

## Interactive Workflow

### Phase 1: Gather context

Ask the user these questions (use AskUserQuestion or conversational prompts):

1. **Customer name** — Display name for the deliverable (e.g., "Encappture")
2. **Route slug** — URL path for `diff.sprintzero.sh/{slug}` (e.g., `encappture-cms`). Suggest kebab-case.
3. **Engagement name** — Short project title (e.g., "CMS React Modernization")
4. **Lead name** — Who's leading the engagement (default: "Marcel Fahle")
5. **Status** — "In Progress" or "Complete"
6. **PR URLs** — List of GitHub PR URLs to include as tabs. Ask: "Which PRs should I include? Paste the URLs."
7. **Summary context** — Ask: "Give me the one-liner on what this engagement is about and why it matters."
8. **Updates / milestones** — Ask: "Any updates beyond the PRs? Meetings scheduled, decisions made, milestones hit?"
9. **What's Next** — Ask: "What's coming up next? List the upcoming work items in priority order."

### Phase 2: Research PRs

For each PR URL provided:

```bash
gh pr view {number} --repo {owner}/{repo} --json title,body,files,additions,deletions,changedFiles,state,mergedAt,url
gh pr diff {number} --repo {owner}/{repo} --stat
```

Extract:
- PR title, description, and scope
- Files changed, additions, deletions
- Key patterns and what was done
- Business impact (translate technical changes into value)

### Phase 3: Generate content

Create the deliverable files following this structure:

#### File 1: `README.md` (Summary tab — always first)

```markdown
---
client: "{Customer Name}"
engagement: "{Engagement Name}"
delivered: "{Month Year}"
lead: "{Lead Name}"
status: "{Status}"
---

# {Engagement Name}

> [!IMPORTANT]
> **{One-line value statement.}** {One sentence expanding on it.}

## The Situation

{2-3 sentences on the problem being solved. Business language, not technical.}

## Updates

{Reverse-chronological list of milestones. Each entry:}
- **{Milestone}** — {One sentence. Reference tab name if there's a detail page.}

> [!NOTE]
> **Key metrics so far**
>
> | Metric | Before | After |
> |--------|--------|-------|
> | {metric} | {before} | {after} |

## What's Next

> [!TIP]
> Upcoming work in priority order.

1. **{Item}** — {One sentence}

---

*Delivered by [Sprint Zero](https://sprintzero.sh) · {Month Year}*
```

#### File 2+: One file per PR (Detail tabs)

Name each file descriptively — this becomes the tab label. Use title case with spaces (e.g., `Modernization Foundation.md`, `Store Simplification.md`). Derive the name from what the PR accomplished, not the PR number.

```markdown
# {Descriptive Title}

> [!IMPORTANT]
> **{Bold stat or outcome.}** {One sentence on what this means.}

## What We Did

{2-3 sentences. CEO-readable. What happened and why.}

## Why It Matters

- **{Benefit}** — {Explanation in business terms}
- **{Benefit}** — {Explanation in business terms}

## What Changed

> [!NOTE]
> {Table with key data — dependency changes, scope, metrics}

{High-level description of changes, organized by area}

## For Developers

<details>
<summary>Technical reference — files and patterns</summary>

{Detailed technical breakdown — file counts, patterns used, migration approach.
This section is for developers who need to understand the implementation.}

</details>

> **Pull request:** [{owner}/{repo}#{number}]({pr_url})

---

*Delivered by [Sprint Zero](https://sprintzero.sh) · {Month Year}*
```

### Phase 4: Review with user

Before creating the gist, show the user a preview of each file's content. Ask:

> "Here's what I've drafted. Want me to adjust anything before I publish?"

Iterate until the user approves.

### Phase 5: Publish

1. **Write files** to a temp directory
2. **Create secret gist:**
   ```bash
   cd /tmp/{deliverable-dir} && gh gist create {files...} \
     -d '{Customer} · {Engagement Name} · {Month Year}'
   ```
3. **Update `deliverables.json`** in the diff.sprintzero.sh project:
   ```json
   "{route-slug}": {
     "name": "{Customer Name}",
     "default": "{project-slug}",
     "projects": {
       "{project-slug}": {
         "gistId": "{gist-id}",
         "name": "{Engagement Name}",
         "date": "{YYYY-MM}"
       }
     }
   }
   ```
4. **Commit and push** `deliverables.json`
5. **Warm cache:** `curl -s https://diff.sprintzero.sh/{route-slug}`
6. **Share URL:** `https://diff.sprintzero.sh/{route-slug}`

## Writing Style Guide

The deliverable should feel like **Unreasonable Hospitality** — the client gets something they've never received before. Every word earns its place.

### Smart Brevity principles

- **Lead with the "so what"** — Start every section with why the reader should care
- **Bold the key point** — Scannable in 5 seconds
- **One idea per paragraph** — Short paragraphs, often just one sentence
- **Business first, technical second** — CEOs scan the top, developers scroll down
- **Tables over prose** — For metrics, dependencies, scope — tables are faster to read
- **Active voice** — "We removed 130 files" not "130 files were removed"

### GFM alert usage

- `> [!IMPORTANT]` — Hero statement at the top of each page. The single most important takeaway.
- `> [!NOTE]` — Data tables, key metrics. Things the reader should know.
- `> [!TIP]` — Recommendations, what's next. Forward-looking, actionable.
- `> [!WARNING]` — Deferred work, known limitations. Things intentionally left for later.
- `> [!CAUTION]` — Remaining risks. Use sparingly.

### Tab naming

- `README.md` — Always the summary page (first tab)
- Other tabs: Title case with spaces, derived from what was accomplished
- Good: `Modernization Foundation.md`, `Store Simplification.md`
- Bad: `PR-21.md`, `TECHNICAL.md`, `phase-1.md`

### Tone

- Confident but not arrogant
- Direct but not cold
- Technical credibility without jargon overload
- Write as if the reader's time is the most valuable thing in the world

## Rules

1. **Always ask before publishing** — Never create the gist without user approval of the content
2. **Always secret gists** — Never public. Client deliverables are confidential.
3. **Always include `-d` flag** — Description format: `{Customer} · {Engagement Name} · {Month Year}`
4. **README.md is required** — Every deliverable needs a summary page
5. **Research PRs thoroughly** — Read the full PR description and diff stats. Don't guess.
6. **Business language first** — Translate every technical change into business value
7. **Keep metrics honest** — Only include before/after numbers you can verify from the PR data
8. **Iterate with the user** — The first draft is a draft. Expect at least one round of feedback.

## Updating an Existing Deliverable

When adding new PRs or updates to an existing deliverable:

1. Fetch the current gist: `gh gist view {gist-id} --files`
2. Download existing files: `gh gist clone {gist-id} /tmp/{dir}`
3. Add new tab files and update `README.md` with new entries in the Updates section
4. Update the gist: `gh gist edit {gist-id} --add {new-files...}`
5. Update existing files: Write to the cloned dir and `gh gist edit {gist-id} -f {filename} {filepath}`
6. Bust cache: `curl -s -X POST https://diff.sprintzero.sh/api/refresh/{gist-id}`
