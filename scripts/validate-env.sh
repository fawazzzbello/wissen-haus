#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Load environment
if [ -f ".env.local" ]; then
    export $(cat .env.local | xargs)
elif [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

echo "Validating environment configuration..."
echo ""

# Critical variables
check_critical() {
    local var=$1
    local description=$2
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗ CRITICAL: $var not set ($description)${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ $var set${NC}"
    fi
}

# Optional variables
check_optional() {
    local var=$1
    local description=$2
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠ Optional: $var not set ($description)${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ $var set${NC}"
    fi
}

# Validation functions
validate_url() {
    local url=$1
    if [[ ! $url =~ ^https?:// ]]; then
        echo -e "${RED}✗ Invalid URL format: $url${NC}"
        return 1
    fi
    return 0
}

validate_api_key() {
    local key=$1
    local prefix=$2
    if [[ ! $key =~ ^${prefix} ]]; then
        echo -e "${RED}✗ Invalid API key format (should start with $prefix): $key${NC}"
        return 1
    fi
    return 0
}

# Database validation
echo "Database Configuration:"
if [ -n "$DATABASE_URL" ]; then
    check_critical "DATABASE_URL" "PostgreSQL connection string (Railway format)"
else
    check_critical "DB_HOST" "Database host"
    check_critical "DB_PORT" "Database port"
    check_critical "DB_USER" "Database user"
    check_critical "DB_NAME" "Database name"
fi

# Frontend validation
echo ""
echo "Frontend Configuration:"
check_critical "FRONTEND_URL" "Frontend application URL"
check_critical "NEXT_PUBLIC_API_URL" "API URL for client-side calls"

if [ -n "$NEXT_PUBLIC_API_URL" ]; then
    validate_url "$NEXT_PUBLIC_API_URL"
fi

# API internal URL (for Railway)
if [ -n "$API_INTERNAL_URL" ]; then
    echo -e "${GREEN}✓ API_INTERNAL_URL set (for server-side proxying)${NC}"
else
    echo -e "${YELLOW}⚠ API_INTERNAL_URL not set (required for Railway production)${NC}"
    ((WARNINGS++))
fi

# Optional services
echo ""
echo "Optional Services:"

if [ -n "$SENDGRID_API_KEY" ]; then
    if validate_api_key "$SENDGRID_API_KEY" "SG\."; then
        echo -e "${GREEN}✓ SendGrid API key format valid${NC}"
    fi
else
    echo -e "${YELLOW}⚠ SendGrid not configured (email features disabled)${NC}"
    ((WARNINGS++))
fi

if [ -n "$STRIPE_PUBLIC_KEY" ]; then
    if validate_api_key "$STRIPE_PUBLIC_KEY" "pk_"; then
        echo -e "${GREEN}✓ Stripe public key format valid${NC}"
    fi
    if [ -n "$STRIPE_SECRET_KEY" ]; then
        if validate_api_key "$STRIPE_SECRET_KEY" "sk_"; then
            echo -e "${GREEN}✓ Stripe secret key format valid${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ Stripe not fully configured (payment features disabled)${NC}"
    ((WARNINGS++))
fi

if [ -n "$AI_PROVIDER" ]; then
    check_optional "ANTHROPIC_API_KEY" "Anthropic Claude API" || true
    check_optional "GOOGLE_GEMINI_API_KEY" "Google Gemini API" || true
    check_optional "OPENAI_API_KEY" "OpenAI API" || true
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Validation passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS optional service(s) not configured${NC}"
    fi
    exit 0
else
    echo -e "${RED}✗ Validation failed with $ERRORS error(s)${NC}"
    exit 1
fi
