#!/bin/bash

# Manual deployment script for Claims App
set -e

PROJECT_ID="meta-episode-466920-h4"
REGION="us-central1"
DB_INSTANCE="claims-db-manual"
DB_NAME="claims"
DB_USER="claims_user"
DB_PASSWORD="ClaimsApp2024!SecurePassword"
REGISTRY_NAME="claims-app"
BUCKET_NAME="${PROJECT_ID}-claims-frontend-manual"

echo "🚀 Starting manual deployment for Claims App..."

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable compute.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable sqladmin.googleapis.com --project=$PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

echo "⏰ Waiting for APIs to be fully enabled..."
sleep 30

# Create Artifact Registry
echo "📦 Creating Artifact Registry..."
if ! gcloud artifacts repositories describe $REGISTRY_NAME --location=$REGION --project=$PROJECT_ID 2>/dev/null; then
    gcloud artifacts repositories create $REGISTRY_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for Claims App" \
        --project=$PROJECT_ID
fi

# Check if Cloud SQL instance already exists
echo "🗄️ Setting up Cloud SQL..."
if gcloud sql instances describe $DB_INSTANCE --project=$PROJECT_ID 2>/dev/null; then
    echo "Cloud SQL instance $DB_INSTANCE already exists, skipping creation..."
else
    echo "Creating Cloud SQL instance $DB_INSTANCE (this may take 5-10 minutes)..."
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=HDD \
        --storage-size=10GB \
        --no-storage-auto-increase \
        --no-backup \
        --authorized-networks=0.0.0.0/0 \
        --project=$PROJECT_ID
fi

# Create database and user
echo "🔧 Setting up database and user..."
if ! gcloud sql databases describe $DB_NAME --instance=$DB_INSTANCE --project=$PROJECT_ID 2>/dev/null; then
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE --project=$PROJECT_ID
fi

if ! gcloud sql users describe $DB_USER --instance=$DB_INSTANCE --project=$PROJECT_ID 2>/dev/null; then
    gcloud sql users create $DB_USER --instance=$DB_INSTANCE --password="$DB_PASSWORD" --project=$PROJECT_ID
fi

# Get database IP
DB_IP=$(gcloud sql instances describe $DB_INSTANCE --project=$PROJECT_ID --format="value(ipAddresses[0].ipAddress)")

echo "🗄️ Database IP: $DB_IP"

# Create Cloud Storage bucket
echo "🪣 Creating Cloud Storage bucket..."
if ! gsutil ls -b gs://$BUCKET_NAME 2>/dev/null; then
    gsutil mb -l $REGION gs://$BUCKET_NAME
    gsutil web set -m index.html -e index.html gs://$BUCKET_NAME
    gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
fi

# Set CORS configuration for the bucket
echo "🔧 Setting up CORS configuration..."
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Range"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://$BUCKET_NAME

# Configure Docker for Artifact Registry
echo "🐳 Configuring Docker..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# Build and push API container
echo "🏗️ Building and pushing API container..."
cd ../api
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY_NAME/api:latest .
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY_NAME/api:latest

# Deploy to Cloud Run
echo "☁️ Deploying API to Cloud Run..."
gcloud run deploy claims-api \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY_NAME/api:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 2 \
    --concurrency 80 \
    --cpu-throttling \
    --set-env-vars="SPRING_DATASOURCE_URL=jdbc:postgresql://$DB_IP:5432/$DB_NAME,SPRING_DATASOURCE_USERNAME=$DB_USER,SPRING_DATASOURCE_PASSWORD=$DB_PASSWORD,SPRING_JPA_HIBERNATE_DDL_AUTO=update" \
    --project=$PROJECT_ID

# Get Cloud Run URL
API_URL=$(gcloud run services describe claims-api --region=$REGION --project=$PROJECT_ID --format="value(status.url)")

# Build and deploy frontend
echo "🌐 Building and deploying frontend..."
cd ../claims-app

# Check if Angular environment file exists and update API endpoint
if [ -f "src/environments/environment.ts" ]; then
    echo "📝 Updating API endpoint in environment file..."
    # Create a backup
    cp src/environments/environment.ts src/environments/environment.ts.bak
    # Update the API URL (assuming it has an apiUrl property)
    sed -i.tmp "s|apiUrl:.*|apiUrl: '$API_URL',|g" src/environments/environment.ts || true
fi

# Install dependencies and build
if command -v pnpm &> /dev/null; then
    pnpm install
    pnpm run build --base-href="https://storage.googleapis.com/$BUCKET_NAME/"
else
    npm install
    npm run build --base-href="https://storage.googleapis.com/$BUCKET_NAME/"
fi

# Upload to Cloud Storage
gsutil -m cp -r dist/claims-app/browser/* gs://$BUCKET_NAME/

# Set correct content types for files
echo "📝 Setting content types for files..."
gsutil ls gs://$BUCKET_NAME/ | grep '\.js$' | xargs -I {} gsutil setmeta -h "Content-Type:text/javascript" {}
gsutil ls gs://$BUCKET_NAME/ | grep '\.css$' | xargs -I {} gsutil setmeta -h "Content-Type:text/css" {}

echo "✅ Deployment completed successfully!"
echo ""
echo "🔗 API URL: $API_URL"
echo "🔗 Frontend URL: https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo "🗄️ Database: $DB_IP:5432/$DB_NAME"
echo ""
echo "💡 Your Claims App is now deployed and ready to use!"