# Start Development from Issue

Start the AI autonomous development process for a GitHub Issue.

## Usage

```
/dev-start <issue-number>
```

## Arguments

- `issue-number`: The GitHub Issue number to work on (required: $ARGUMENTS)

## Process Flow

Execute the following steps in order:

### Step 1: Issue Analysis
1. Fetch the issue details using GitHub MCP tools
2. Read and understand the requirements
3. If the issue lacks sufficient detail, ask clarifying questions before proceeding

### Step 2: Architecture & Design (architect-ai)
Use the `architect-ai` subagent to:
1. Analyze the requirements from the issue
2. Design the technical approach
3. Break down into implementable tasks
4. Output: Design document (can be informal for small changes)

### Step 3: Design Review (parallel execution)
For non-trivial changes, use these subagents in parallel:
- `design-document-reviewer`: Check for ambiguities and completeness
- `design-security-reviewer`: Threat modeling and security considerations

If issues are found, iterate with architect-ai until resolved.

### Step 4: Implementation (developer-ai)
Use the `developer-ai` subagent to:
1. Implement the code changes based on the design
2. Write unit tests
3. Get guidance from `language-framework-expert` as needed

### Step 5: Quality Checks
Run `/dev-check` command to execute all quality validations.

### Step 6: PR Creation
If all checks pass, use the `pr-creator` subagent to create a pull request.
- Link the PR to the original issue
- Include summary of changes and test plan

## Important Notes

- Always create a feature branch before making changes
- Never skip the quality check phase
- If any agent reports critical issues, address them before proceeding
- For simple bug fixes, design phase can be abbreviated
- For large features, consider breaking into multiple PRs

## Example

```
/dev-start 42
```

This will start development for Issue #42, going through the full autonomous development pipeline.
