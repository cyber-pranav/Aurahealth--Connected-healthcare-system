#!/bin/bash
# deploy.sh — One-shot manual deployment script for Aura Health Systems
# Usage: ./deploy.sh YOUR_GCP_PROJECT_ID your-mongo-atlas-uri
# Example: ./deploy.sh my-gcp-project "mongodb+srv://user:pass@cluster.mongodb.net/healthcare_mvp"

set -e

# ── CONFIGURATION ────────────────────────────────────────────────────────────
PROJECT_ID="${1:-YOUR_GCP_PROJECT_ID}"
MONGO_URI="${2:-YOUR_MONGODB_ATLAS_URI}"
REGION="asia-south1"          # Mumbai. Change to us-central1, europe-west1, etc.
BACKEND_SERVICE="aura-backend"
FRONTEND_SERVICE="aura-frontend"
JWT_SECRET="aura_health_hackathon_jwt_secret_2026"

echo "🚀 Deploying Aura Health Systems to Google Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo ""

# ── PREREQUISITES CHECK ──────────────────────────────────────────────────────
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install it from: https://docs.docker.com/get-docker/"
    exit 1
fi

# ── SETUP ────────────────────────────────────────────────────────────────────
echo "📋 Setting project..."
gcloud config set project "$PROJECT_ID"

echo "🔌 Enabling required APIs..."
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com

echo "🐳 Configuring Docker for GCR..."
gcloud auth configure-docker --quiet

# ── SECRETS (Secret Manager) ─────────────────────────────────────────────────
echo "🔐 Storing secrets in Secret Manager..."

# Create MONGO_URI secret
echo -n "$MONGO_URI" | gcloud secrets create aura-mongo-uri \
    --data-file=- --replication-policy=automatic 2>/dev/null || \
    echo -n "$MONGO_URI" | gcloud secrets versions add aura-mongo-uri --data-file=-

# Create JWT_SECRET secret
echo -n "$JWT_SECRET" | gcloud secrets create aura-jwt-secret \
    --data-file=- --replication-policy=automatic 2>/dev/null || \
    echo -n "$JWT_SECRET" | gcloud secrets versions add aura-jwt-secret --data-file=-

echo "✅ Secrets stored."

# ── BACKEND ──────────────────────────────────────────────────────────────────
echo ""
echo "🔨 Building backend Docker image..."
docker build -t "gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest" ./backend

echo "📤 Pushing backend image..."
docker push "gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest"

echo "☁️  Deploying backend to Cloud Run..."
gcloud run deploy "$BACKEND_SERVICE" \
    --image="gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest" \
    --region="$REGION" \
    --platform=managed \
    --allow-unauthenticated \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --update-secrets="MONGO_URI=aura-mongo-uri:latest,JWT_SECRET=aura-jwt-secret:latest" \
    --set-env-vars="NODE_ENV=production"

# Get the backend URL
BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" \
    --region="$REGION" --format='value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# ── FRONTEND ─────────────────────────────────────────────────────────────────
echo ""
echo "🔨 Building frontend Docker image (with backend URL injected)..."
docker build \
    --build-arg VITE_API_URL="$BACKEND_URL" \
    -t "gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest" \
    ./frontend

echo "📤 Pushing frontend image..."
docker push "gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest"

echo "☁️  Deploying frontend to Cloud Run..."
gcloud run deploy "$FRONTEND_SERVICE" \
    --image="gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest" \
    --region="$REGION" \
    --platform=managed \
    --allow-unauthenticated \
    --port=8080 \
    --memory=256Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=5 \
    --set-env-vars="BACKEND_URL=$BACKEND_URL"

# Get the frontend URL
FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" \
    --region="$REGION" --format='value(status.url)')

# ── Update backend CORS with frontend URL ────────────────────────────────────
echo ""
echo "🔗 Updating backend CORS with frontend URL..."
gcloud run services update "$BACKEND_SERVICE" \
    --region="$REGION" \
    --update-env-vars="FRONTEND_URL=$FRONTEND_URL"

# ── DONE ─────────────────────────────────────────────────────────────────────
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "   🌐 Frontend: $FRONTEND_URL"
echo "   🔌 Backend:  $BACKEND_URL"
echo "   ✅ Health:   $BACKEND_URL/health"
echo ""
echo "Share $FRONTEND_URL with your hackathon judges!"
