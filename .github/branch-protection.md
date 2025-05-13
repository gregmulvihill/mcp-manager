# Branch Protection Settings
#
# This file defines branch protection rules using GitHub repository settings.
# Learn more about branch protection at: 
# https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

# Branch protection for the main branch:
# - Requires pull requests
# - Requires at least 1 review before merging
# - Dismisses stale reviews
# - Enforces for administrators

# Additionally, the repository uses a GitHub Action to ensure these rules
# are applied correctly. See the workflow file at .github/workflows/branch-protection.yml
