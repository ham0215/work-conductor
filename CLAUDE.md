# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commits

When committing changes, always use the `conventional-committer` agent. This ensures:
- Commits follow the Conventional Commits specification
- Proper commit message structure with type, scope, and description
- Background context is included in the commit body
- `Co-Authored-By: Claude <noreply@anthropic.com>` is always included

If the changes being committed contain multiple distinct concerns or purposes, split them into separate commits—one per concern—rather than bundling everything into a single commit.
