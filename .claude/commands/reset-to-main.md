# Reset to Main Branch

Reset local branch to main and pull the latest changes.

## Steps

1. First, check for uncommitted changes (`git status`)
2. If there are uncommitted changes, abort the process and notify the user with:
   - "You have uncommitted changes. Please commit or stash your changes before running again."
   - Also display the list of changed files
3. If there are no uncommitted changes, execute the following:
   - `git checkout main` to switch to the main branch
   - `git pull` to fetch the latest state
4. Delete all local branches except main:
   - List all local branches except main using `git branch | grep -v '^\* main$' | grep -v '^  main$'`
   - Delete each branch using `git branch -D <branch-name>`
   - Display the list of deleted branches
5. When complete, display the current branch and latest commit information
