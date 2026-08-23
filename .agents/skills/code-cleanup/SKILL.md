---
name: Code Cleanup and Commit
description: Automatically run linters, fix TypeScript errors, format code, and create clean, conventional Git commits for a repository.
---

# Code Cleanup and Commit Skill

This skill provides a standardized workflow for agents to clean up a codebase and safely commit the changes.

## Prerequisites
- The workspace must have `eslint` or another linter configured.
- Git must be initialized.

## Execution Steps

### 1. Identify and Fix Linter Errors
- Run `npm run lint` or `npx eslint --fix .` to automatically fix formatting, unused imports, and `const/let` assignment issues.
- Check the output for any remaining TypeScript compilation errors (e.g. `npx tsc --noEmit` or build command).
- Use `multi_replace_file_content` to manually fix any remaining TypeScript type errors that the linter cannot auto-fix.

### 2. Verify Application Integrity
- Run the project's build command (e.g. `npm run build`) to ensure that removing dead code didn't inadvertently break the production build.
- If the build fails, fix the underlying issues before proceeding to commit.

### 3. Create Clean Git Commits
- Stage all the cleaned files: `git add .`
- Follow Conventional Commits format for the commit message. Use `chore` for purely structural cleanup:
  - `git commit -m "chore: clean up dead code and fix linter warnings"`
  - `git commit -m "fix: resolve TypeScript build errors in map component"`
- Never use `&&` in Windows PowerShell environments. If you must chain commands, use `cmd.exe /c "git add . && git commit -m '...'"` or run them as separate tool calls.

## Post-Execution
- Present a brief summary to the user indicating how many files were modified and the specific commit message that was used.
