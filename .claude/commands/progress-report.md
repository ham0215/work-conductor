# Generate Progress Report

Generate a comprehensive development progress report and create a GitHub Issue.

## Instructions

Use the `progress-reporter` subagent to analyze the project and create a progress report.

The agent will:
1. Read `docs/requirements/PRD.md` to understand the project scope
2. Analyze GitHub Issues (open and closed) to calculate completion rates
3. Examine the codebase structure to verify implementation status
4. Create a GitHub Issue with the progress report titled "Development Progress Report - YYYY/MM/DD"
5. Add `documentation` and `report` labels to the issue

## Expected Output

After completion, report:
- The created Issue number and URL
- Overall completion rate
- Key progress points
