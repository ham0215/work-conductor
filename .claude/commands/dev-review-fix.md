# Fix Review Comments

Address review comments on the current pull request.

## Usage

```
/dev-review-fix <pr-number>
```

## Arguments

- `pr-number`: The Pull Request number to address (required: $ARGUMENTS)

## Process Flow

### Step 1: Fetch Review Comments
1. Get all review comments from the PR using GitHub MCP tools
2. Get the overall review status (approved, changes requested, etc.)
3. Categorize comments by:
   - Blocking (changes requested)
   - Suggestions (optional improvements)
   - Questions (need response)

### Step 2: Analyze Comments
For each comment:
1. Understand the feedback
2. Determine if it requires:
   - Code change
   - Response/clarification
   - Discussion (ask user for decision)

### Step 3: Address Comments

#### For Code Changes
Use the `developer-ai` subagent to:
1. Implement the requested changes
2. Ensure changes don't break existing functionality
3. Update tests if needed

#### For Clarification Questions
1. Analyze the code and context
2. Post a reply explaining the rationale
3. If the reviewer has a point, make the change instead

#### For Suggestions
1. Evaluate the suggestion merit
2. If beneficial, implement the change
3. If not implementing, reply with reasoning

### Step 4: Quality Recheck
After making changes, run `/dev-check` to ensure:
- All tests still pass
- No new issues introduced
- Coverage maintained

### Step 5: Update PR
1. Commit changes with clear messages referencing the review
2. Push to the PR branch
3. Reply to review comments indicating changes made
4. Request re-review if needed

## Output Format

```markdown
## Review Comment Resolution

### Addressed Comments
| Comment | Action | Status |
|---------|--------|--------|
| [Summary] | Code change / Reply | Done |

### Pending Items
- [Items needing user decision]

### Changes Made
- [List of commits]

### Ready for Re-review: YES / NO
```

## Important Notes

- Never dismiss feedback without proper consideration
- If you disagree with a suggestion, explain why respectfully
- For subjective matters, ask the user for their preference
- Always re-run quality checks after making changes
