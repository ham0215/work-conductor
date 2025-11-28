# Run Quality Checks

Execute comprehensive quality checks using the AI agent guardrails.

## Usage

```
/dev-check
```

## Process Flow

Execute the following checks. Run independent checks in parallel where possible.

### Phase 1: Static Analysis (parallel)

#### Code Quality
- Run linter: `npm run lint` (if available)
- Run type check: `npm run build:check` or `tsc --noEmit` (if TypeScript)
- Run formatter check: `npm run format:check` (if available)

#### Security (sast-agent)
Use the `sast-agent` subagent to:
- Scan for security vulnerabilities (SQL injection, XSS, etc.)
- Check for hardcoded secrets
- Identify insecure dependencies
- Review OWASP Top 10 compliance

### Phase 2: Test Analysis (parallel)

#### Test Execution
- Run tests: `npm run test:run` or equivalent
- Collect coverage report

#### Coverage Monitor (coverage-monitor)
Use the `coverage-monitor` subagent to:
- Analyze coverage report
- Verify coverage meets thresholds
- Detect coverage regression

#### White-Box Test Review (whitebox-test-reviewer)
Use the `whitebox-test-reviewer` subagent to:
- Check branch coverage
- Verify boundary value testing
- Ensure error paths are tested

#### Black-Box Test Review (blackbox-test-reviewer)
Use the `blackbox-test-reviewer` subagent to:
- Verify all requirements have tests
- Check traceability matrix
- Identify missing functional tests

### Phase 3: Design Compliance (parallel)

#### Acceptance Test Review (acceptance-test-reviewer)
Use the `acceptance-test-reviewer` subagent to:
- Verify acceptance criteria coverage
- Check test scenario quality

#### Common Sense Review (common-sense-agent)
Use the `common-sense-agent` subagent to:
- Check for UX issues
- Verify safety measures (confirmations for destructive actions)
- Identify missing error handling
- Review accessibility basics

### Phase 4: Language Best Practices

#### Framework Expert (language-framework-expert)
Use the `language-framework-expert` subagent to:
- Check for deprecated features
- Verify framework best practices
- Identify performance anti-patterns

## Output Format

After all checks complete, produce a summary report:

```markdown
## Quality Check Results

| Check | Status | Issues |
|-------|--------|--------|
| Lint | PASS/FAIL | count |
| Type Check | PASS/FAIL | count |
| Tests | PASS/FAIL | count |
| Coverage | XX% | target: YY% |
| SAST | PASS/FAIL | critical: X, high: Y |
| Common Sense | PASS/FAIL | count |
| ... | ... | ... |

### Critical Issues (must fix)
1. [Issue description]

### Warnings (should fix)
1. [Warning description]

### Overall Status: PASS / FAIL
```

## Exit Criteria

- **PASS**: All critical checks pass, no blocking issues
- **FAIL**: Any critical issue found, must be resolved before PR

## Notes

- Some checks may be skipped if not applicable to the project
- DAST checks are not included here (require running application)
- For E2E tests, use separate test environment
