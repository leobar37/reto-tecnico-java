#!/bin/bash

# Deploy Claims App to GCP
# Usage: ./deploy.sh PROJECT_ID REGION [DB_PASSWORD]

set -e

PROJECT_ID=${1:-}
REGION=${2:-us-central1}
DB_PASSWORD=${3:-}

if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID is required"
    echo "Usage: ./deploy.sh PROJECT_ID [REGION] [DB_PASSWORD]"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "Enter database password:"
    read -s DB_PASSWORD
fi

echo "🚀 Deploying Claims App to GCP..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# Configure Pulumi
echo "📋 Configuring Pulumi..."
pulumi config set gcp:project "$PROJECT_ID"
pulumi config set gcp:region "$REGION"
pulumi config set --secret claims-app-deploy:db-password "$DB_PASSWORD"

# Deploy infrastructure
echo "🏗️ Deploying infrastructure..."
pulumi up --yes

# Get outputs
REGISTRY_URL=$(pulumi stack output registryUrl)
API_URL=$(pulumi stack output apiUrl)
BUCKET_NAME=$(pulumi stack output bucketName)

echo "📦 Building and deploying API..."
cd ../api

# Build Docker image
docker build -t "$REGISTRY_URL/api:latest" .

# Configure Docker for GCP
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

# Push to registry
docker push "$REGISTRY_URL/api:latest"

# Deploy to Cloud Run
gcloud run deploy claims-api \
    --image "$REGISTRY_URL/api:latest" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --quiet

echo "🌐 Building and deploying frontend..."
cd ../claims-app

# Install dependencies and build
pnpm install
pnpm run build

# Upload to Cloud Storage
gsutil -m cp -r dist/claims-app/browser/* "gs://$BUCKET_NAME/"

echo "✅ Deployment complete!"
echo "🔗 API URL: $API_URL"
echo "🔗 Frontend URL: https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo ""
echo "💡 To make the frontend work with the API, update the API endpoint in your Angular app configuration."