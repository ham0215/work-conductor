# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commits

When committing changes, always use the `conventional-committer` agent. This ensures:
- Commits follow the Conventional Commits specification
- Proper commit message structure with type, scope, and description
- Background context is included in the commit body
- `Co-Authored-By: Claude <noreply@anthropic.com>` is always included
- All commit messages are written in English

If the changes being committed contain multiple distinct concerns or purposes, split them into separate commits—one per concern—rather than bundling everything into a single commit.

## Pull Requests

When creating a pull request, always use the `pr-creator` agent. This ensures:
- PR titles follow the Conventional Commits specification
- The repository's PR template is properly applied
- Branch creation is handled automatically if on main branch
- All PR titles and descriptions are written in English
- The authenticated user is automatically assigned to the PR

## Git Commands

When running git commands, do NOT use the `-C` option to specify the directory. The working directory is already set to the repository root, so commands like `git status` work directly without needing `git -C /path/to/repo status`.
