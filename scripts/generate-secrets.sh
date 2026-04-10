#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Secure Credential Generation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Generate secure JWT secrets
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

echo -e "\n${GREEN}Generated Secrets:${NC}"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"

# Create a secrets file (not in version control)
SECRETS_FILE=".env.secrets"

if [ -f "$SECRETS_FILE" ]; then
    echo -e "\n${BLUE}Appending to existing $SECRETS_FILE${NC}"
else
    echo -e "\n${BLUE}Creating new $SECRETS_FILE${NC}"
    echo "# Automatically generated secrets - KEEP THIS FILE SECRET" > "$SECRETS_FILE"
    echo "# DO NOT commit to version control" >> "$SECRETS_FILE"
    echo "" >> "$SECRETS_FILE"
    chmod 600 "$SECRETS_FILE"
fi

echo "JWT_SECRET=$JWT_SECRET" >> "$SECRETS_FILE"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" >> "$SECRETS_FILE"
echo "SESSION_SECRET=$SESSION_SECRET" >> "$SECRETS_FILE"

echo -e "\n${GREEN}✓ Secrets saved to $SECRETS_FILE${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Copy these secrets to your Railway environment variables"
echo "2. Or add them to your .env.local:"
echo "   cat $SECRETS_FILE >> .env.local"
echo ""

exit 0
