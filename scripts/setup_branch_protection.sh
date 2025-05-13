#!/bin/bash

# Script to set up branch protection rules for CogentEcho.ai repositories
# Requires: GitHub CLI (gh) installed and authenticated

# Array of repositories to protect
REPOSITORIES=(
  "orchestrate-ai"
  "automated-dev-agents"
  "multi-tiered-memory-architecture"
  "mcp-manager"
  "claude-voice-mcp"
  "claude-voice-mcp-fork"
)

# Default branch names to protect (usually main or master)
BRANCH_PATTERNS=("main" "master")

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "GitHub CLI (gh) is not installed. Please install it first."
  exit 1
fi

# Function to set branch protection rules using GraphQL API
set_branch_protection() {
  local owner="gregmulvihill"
  local repo=$1
  local branch_pattern=$2
  
  echo "Setting branch protection for $repo on branch pattern: $branch_pattern"
  
  # Get the repository node ID
  repo_id=$(gh api graphql -f query='
    query($owner:String!, $name:String!) {
      repository(owner:$owner, name:$name) {
        id
      }
    }' -f owner=$owner -f name=$repo | jq -r '.data.repository.id')
  
  if [ -z "$repo_id" ] || [ "$repo_id" == "null" ]; then
    echo "Failed to get repository ID for $repo"
    return 1
  fi
  
  # Create the branch protection rule
  result=$(gh api graphql -f query='
    mutation($repositoryId:ID!, $pattern:String!) {
      createBranchProtectionRule(input: {
        repositoryId: $repositoryId,
        pattern: $pattern,
        requiresApprovingReviews: true,
        requiredApprovingReviewCount: 1,
        dismissesStaleReviews: true,
        restrictsReviewDismissals: false,
        requiresStatusChecks: true,
        requiresStrictStatusChecks: true,
        requiresCodeOwnerReviews: false,
        isAdminEnforced: true
      }) {
        clientMutationId
      }
    }' -f repositoryId=$repo_id -f pattern=$branch_pattern)
  
  echo "Result: $result"
}

# Main execution
for repo in "${REPOSITORIES[@]}"; do
  echo "Processing repository: $repo"
  
  # Check current branch protection rules
  current_rules=$(gh api graphql -f query='
    query($owner:String!, $name:String!) {
      repository(owner:$owner, name:$name) {
        branchProtectionRules(first:100) {
          nodes {
            pattern
            requiresApprovingReviews
            isAdminEnforced
          }
        }
      }
    }' -f owner=gregmulvihill -f name=$repo)
  
  echo "Current branch protection rules for $repo:"
  echo "$current_rules" | jq -r '.data.repository.branchProtectionRules.nodes[] | "- Pattern: \(.pattern), Requires Reviews: \(.requiresApprovingReviews), Admin Enforced: \(.isAdminEnforced)"' 2>/dev/null || echo "None or error"
  
  # Get default branch for the repository
  default_branch=$(gh api repos/gregmulvihill/$repo --jq '.default_branch')
  echo "Default branch: $default_branch"
  
  # Add the default branch to the patterns if not already included
  if [[ ! " ${BRANCH_PATTERNS[@]} " =~ " ${default_branch} " ]]; then
    BRANCH_PATTERNS+=("$default_branch")
  fi
  
  # Apply protection rules for each branch pattern
  for pattern in "${BRANCH_PATTERNS[@]}"; do
    if [[ "$current_rules" != *"\"pattern\": \"$pattern\""* ]]; then
      echo "Setting up protection rule for pattern: $pattern"
      set_branch_protection "$repo" "$pattern"
    else
      echo "Protection rule for pattern '$pattern' already exists"
    fi
  done
  
  echo "Completed processing for $repo"
  echo "-----------------------------------------"
done

echo "Branch protection setup completed!"
