# Branch Protection Setup for CogentEcho.ai Repositories

This directory contains scripts to ensure consistent branch protection across all CogentEcho.ai ecosystem repositories.

## Branch Protection Rules

Branch protection rules help enforce code quality and security by:

1. Requiring pull request reviews before merging
2. Preventing direct pushes to protected branches
3. Requiring status checks to pass before merging
4. Preventing branch deletion
5. Enforcing consistent merge practices

## Setup Script

The `setup_branch_protection.sh` script will:

- Check existing branch protection rules for each repository
- Add protection rules for main/master branches if they don't exist
- Configure the following protection settings:
  - Require pull request reviews (at least 1)
  - Dismiss stale pull request approvals when new commits are pushed
  - Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Apply rules to administrators

## Prerequisites

Before running the script, ensure you have:

1. GitHub CLI (`gh`) installed and authenticated
2. Sufficient permissions (admin access) to all repositories
3. `jq` installed for JSON processing

## Usage

```bash
# Navigate to the scripts directory
cd scripts

# Make the script executable
chmod +x setup_branch_protection.sh

# Run the script
./setup_branch_protection.sh
```

## Repositories Covered

The script will apply branch protection to the following repositories:

- orchestrate-ai
- automated-dev-agents
- multi-tiered-memory-architecture
- mcp-manager
- claude-voice-mcp
- claude-voice-mcp-fork

## Customization

You can customize the protection rules by editing the `setup_branch_protection.sh` file:

- Add or remove repositories in the `REPOSITORIES` array
- Modify branch patterns in the `BRANCH_PATTERNS` array
- Adjust protection settings in the GraphQL mutation

## Manual Verification

After running the script, it's recommended to manually verify the branch protection rules through the GitHub web interface:

1. Go to each repository's Settings page
2. Navigate to Branches
3. Verify that protection rules are correctly applied

## Troubleshooting

If you encounter issues:

- Ensure you have admin access to all repositories
- Check that your GitHub token has the necessary permissions
- Run the script with the `-v` flag for verbose output
- Check the GitHub API response for specific error messages
