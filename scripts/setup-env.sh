#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Wissen-Haus Environment Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}✓ .env.local already exists${NC}"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing .env.local"
        exit 0
    fi
fi

# Detect environment
echo -e "\n${BLUE}Environment Selection:${NC}"
echo "1. Local Development (Docker)"
echo "2. Railway Production"
echo "3. Custom"

read -p "Select environment (1-3): " ENV_CHOICE

case $ENV_CHOICE in
    1)
        ENV_TYPE="local"
        ;;
    2)
        ENV_TYPE="railway"
        ;;
    3)
        ENV_TYPE="custom"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}Database Configuration:${NC}"

if [ "$ENV_TYPE" = "local" ]; then
    echo "Using local PostgreSQL (Docker)"
    DB_HOST="postgres"
    DB_PORT="5432"
    DB_USER="postgres"
    DB_PASSWORD="postgres"
    DB_NAME="wissen_haus_db"
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
elif [ "$ENV_TYPE" = "railway" ]; then
    read -p "Enter Railway DATABASE_URL: " DATABASE_URL
    DB_HOST=""
    DB_PORT=""
    DB_USER=""
    DB_PASSWORD=""
    DB_NAME=""
else
    read -p "Database Host (default: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    read -p "Database Port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    read -p "Database Name (default: wissen_haus_db): " DB_NAME
    DB_NAME=${DB_NAME:-wissen_haus_db}
    read -p "Database User (default: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    read -p "Database Password: " DB_PASSWORD
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
fi

echo -e "\n${BLUE}Frontend Configuration:${NC}"
read -p "Frontend URL (default: http://localhost:3000): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

echo -e "\n${BLUE}API Configuration:${NC}"
read -p "API URL for frontend (default: http://localhost:5000/api): " NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:5000/api}

# For Railway, also need the internal API URL
if [ "$ENV_TYPE" = "railway" ]; then
    read -p "API Internal URL (for server-side proxying, e.g. https://api.railway.app): " API_INTERNAL_URL
fi

echo -e "\n${BLUE}Optional Services:${NC}"

echo -e "\n${YELLOW}SendGrid (Email):${NC}"
read -p "SendGrid API Key (optional, starts with 'SG.'): " SENDGRID_API_KEY
read -p "SendGrid From Email (optional, default: noreply@wissen-haus.org): " SENDGRID_FROM_EMAIL
SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL:-noreply@wissen-haus.org}

echo -e "\n${YELLOW}Stripe (Payments):${NC}"
read -p "Stripe Public Key (optional, starts with 'pk_'): " STRIPE_PUBLIC_KEY
read -p "Stripe Secret Key (optional, starts with 'sk_'): " STRIPE_SECRET_KEY
read -p "Stripe Webhook Secret (optional, starts with 'whsec_'): " STRIPE_WEBHOOK_SECRET

echo -e "\n${YELLOW}AI Integration:${NC}"
read -p "AI Provider (anthropic/gemini/openai, optional): " AI_PROVIDER
if [ -n "$AI_PROVIDER" ]; then
    read -p "$AI_PROVIDER API Key: " AI_API_KEY
fi

echo -e "\n${YELLOW}Twilio (SMS, optional):${NC}"
read -p "Twilio Account SID (optional): " TWILIO_ACCOUNT_SID
read -p "Twilio Auth Token (optional): " TWILIO_AUTH_TOKEN
read -p "Twilio Phone Number (optional): " TWILIO_PHONE_NUMBER

# Generate .env.local
echo -e "\n${BLUE}Generating .env.local...${NC}"

cat > .env.local << EOF
# Environment
NODE_ENV=${ENV_TYPE}
PORT=5000

# Database Configuration
EOF

if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL=$DATABASE_URL" >> .env.local
fi

if [ -n "$DB_HOST" ]; then
    cat >> .env.local << EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
EOF
fi

cat >> .env.local << EOF

# Frontend Configuration
FRONTEND_URL=$FRONTEND_URL
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
EOF

if [ -n "$API_INTERNAL_URL" ]; then
    echo "API_INTERNAL_URL=$API_INTERNAL_URL" >> .env.local
fi

if [ -n "$SENDGRID_API_KEY" ]; then
    cat >> .env.local << EOF

# SendGrid Configuration
SENDGRID_API_KEY=$SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=$SENDGRID_FROM_EMAIL
EOF
fi

if [ -n "$STRIPE_PUBLIC_KEY" ]; then
    cat >> .env.local << EOF

# Stripe Configuration
STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
EOF
fi

if [ -n "$AI_PROVIDER" ]; then
    case $AI_PROVIDER in
        anthropic)
            echo "ANTHROPIC_API_KEY=$AI_API_KEY" >> .env.local
            ;;
        gemini)
            echo "GOOGLE_GEMINI_API_KEY=$AI_API_KEY" >> .env.local
            ;;
        openai)
            echo "OPENAI_API_KEY=$AI_API_KEY" >> .env.local
            ;;
    esac
    echo "AI_PROVIDER=$AI_PROVIDER" >> .env.local
fi

if [ -n "$TWILIO_ACCOUNT_SID" ]; then
    cat >> .env.local << EOF

# Twilio Configuration
TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER
EOF
fi

echo -e "${GREEN}✓ Created .env.local${NC}"

# Validate environment
echo -e "\n${BLUE}Validating environment configuration...${NC}"
bash scripts/validate-env.sh

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Environment setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Review .env.local for any missing or incorrect values"
echo "2. Start Docker services: docker-compose up -d"
echo "3. Run database migrations: npm run migrate"
echo "4. Start development: npm run dev"

exit 0
