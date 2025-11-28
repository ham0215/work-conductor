# Fix CI Failures

Diagnose and fix CI pipeline failures for a pull request.

## Usage

```
/dev-ci-fix <pr-number>
```

## Arguments

- `pr-number`: The Pull Request number with CI failures (required: $ARGUMENTS)

## Process Flow

### Step 1: Identify Failed Workflows
1. Get the PR details and head SHA
2. List all workflow runs for the PR using GitHub MCP tools
3. Identify failed workflows and jobs

### Step 2: Analyze Failures
For each failed job:
1. Fetch the job logs using `get_job_logs` with `failed_only=true`
2. Parse error messages and stack traces
3. Categorize the failure type:
   - **Build Error**: Compilation/transpilation failure
   - **Lint Error**: Code style violations
   - **Type Error**: TypeScript/type checking issues
   - **Test Failure**: Unit/integration test failures
   - **Coverage Drop**: Coverage below threshold
   - **Security Issue**: SAST/dependency vulnerability
   - **Environment Issue**: CI configuration problem

### Step 3: Fix Issues by Category

#### Build Errors
1. Identify the failing file and line
2. Use `developer-ai` to fix compilation issues
3. Verify fix locally with build command

#### Lint Errors
1. Run `npm run lint` locally to reproduce
2. Apply auto-fix if available: `npm run lint -- --fix`
3. Manually fix remaining issues

#### Type Errors
1. Run type check locally
2. Fix type issues in the identified files
3. Avoid using `any` unless absolutely necessary

#### Test Failures
1. Run the failing tests locally
2. Analyze the failure:
   - Test bug: Fix the test
   - Code bug: Fix the implementation
   - Flaky test: Investigate and stabilize
3. Use `developer-ai` for implementation fixes

#### Coverage Drop
1. Identify uncovered lines from coverage report
2. Add tests for uncovered code paths
3. Use `whitebox-test-reviewer` for guidance

#### Security Issues
1. Use `sast-agent` to understand the vulnerability
2. Apply recommended fixes
3. Update dependencies if needed: `npm audit fix`

### Step 4: Verify Fixes
1. Run the same checks locally that failed in CI
2. Use `/dev-check` for comprehensive validation
3. Ensure no new issues introduced

### Step 5: Push and Monitor
1. Commit fixes with descriptive messages
2. Push to the PR branch
3. Monitor the CI run to confirm fixes worked
4. If still failing, repeat the process

## Output Format

```markdown
## CI Failure Resolution

### Failures Identified
| Workflow | Job | Error Type | Status |
|----------|-----|------------|--------|
| CI | build | Type Error | Fixed |
| CI | test | Test Failure | Fixed |

### Fixes Applied
1. [Description of fix 1]
2. [Description of fix 2]

### Commits
- [commit hash] - [message]

### CI Status: Re-running / Passed / Still Failing
```

## Common CI Issues and Solutions

### "Module not found"
- Check import paths
- Verify package is in dependencies
- Run `npm install`

### "Type X is not assignable to type Y"
- Check type definitions
- Add proper type annotations
- Verify interface compatibility

### "Test timeout"
- Check for async issues
- Increase timeout if needed
- Look for hanging promises

### "Coverage decreased"
- Add tests for new code
- Don't delete tests without replacement
- Check coverage thresholds in config

## Important Notes

- Always reproduce failures locally before fixing
- Don't just suppress errors; fix root causes
- If a fix requires significant changes, consult with user
- Document any configuration changes needed
