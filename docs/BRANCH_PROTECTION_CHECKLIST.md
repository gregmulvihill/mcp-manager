# Branch Protection Checklist

This document provides a manual checklist for setting up branch protection on all CogentEcho.ai ecosystem repositories.

## Why Branch Protection Matters

Branch protection is essential for:
- Preventing accidental force pushes that could overwrite code
- Enforcing code review via pull requests
- Ensuring tests pass before code is merged
- Maintaining code quality and consistency
- Protecting critical branches from direct changes

## Repositories to Protect

| Repository | Primary Branch | Status | Protection Needed |
|------------|---------------|--------|-------------------|
| [orchestrate-ai](https://github.com/gregmulvihill/orchestrate-ai) | main | ⚠️ | Yes |
| [automated-dev-agents](https://github.com/gregmulvihill/automated-dev-agents) | main | ⚠️ | Yes |
| [multi-tiered-memory-architecture](https://github.com/gregmulvihill/multi-tiered-memory-architecture) | main | ⚠️ | Yes |
| [mcp-manager](https://github.com/gregmulvihill/mcp-manager) | main | ⚠️ | Yes |
| [claude-voice-mcp](https://github.com/gregmulvihill/claude-voice-mcp) | main | ⚠️ | Yes |
| [claude-voice-mcp-fork](https://github.com/gregmulvihill/claude-voice-mcp-fork) | main | ⚠️ | Yes |

## Branch Protection Settings

For each repository, apply these settings:

1. Navigate to repository's Settings > Branches
2. Click "Add rule" next to Branch protection rules
3. Set pattern to `main` (or the default branch name)
4. Apply these settings:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (at least 1)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging (when CI is set up)
   - ✅ Require branches to be up to date before merging
   - ✅ Apply to administrators
   - ✅ Restrict who can push to matching branches (if needed)

## Verification Process

After applying protection rules:
1. Try to push directly to the protected branch - this should fail
2. Create a branch, make changes, and open a pull request
3. Verify that the PR cannot be merged without approval
4. Approve the PR and verify it can now be merged

## Script for Protection Status Check

The following command can be run to check if a branch is protected:

```bash
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/gregmulvihill/REPO_NAME/branches/main/protection
```

A 200 response indicates the branch is protected. A 404 response indicates it is not protected.

## Automated Solution (Future)

Consider implementing the automated branch protection script in:
`mcp-manager/scripts/setup_branch_protection.sh`

This will apply consistent protection across all repositories in the ecosystem.
