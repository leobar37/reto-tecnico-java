#!/bin/bash

# Cleanup Claims App deployment
# Usage: ./cleanup.sh

set -e

echo "🧹 Cleaning up Claims App deployment..."

# Destroy Pulumi stack
echo "🗑️ Destroying infrastructure..."
pulumi destroy --yes

echo "✅ Cleanup complete!"
echo ""
echo "💡 Note: Some resources might take a few minutes to be fully removed."
echo "💡 Check the GCP Console to verify all resources have been deleted."