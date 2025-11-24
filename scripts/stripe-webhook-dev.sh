#!/bin/bash

# Stripe Webhook Forwarding Script for Local Development
# This script forwards Stripe webhooks to your local development server

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔌 Stripe Webhook Forwarding${NC}"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${YELLOW}⚠️  Stripe CLI not found. Installing...${NC}"
    echo ""
    echo "Install via Homebrew:"
    echo "  brew install stripe/stripe-cli/stripe"
    echo ""
    echo "Or download from: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Check if logged in
if ! stripe config --list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Stripe CLI${NC}"
    echo ""
    echo "Please login first:"
    echo "  stripe login"
    echo ""
    exit 1
fi

# Get local server URL (default: localhost:4321)
LOCAL_URL="${1:-http://localhost:4321}"
WEBHOOK_ENDPOINT="${LOCAL_URL}/api/stripe-webhook"

echo -e "${GREEN}✓${NC} Stripe CLI found"
echo -e "${GREEN}✓${NC} Logged in to Stripe"
echo ""
echo -e "${BLUE}Forwarding webhooks to:${NC} ${WEBHOOK_ENDPOINT}"
echo ""
echo -e "${YELLOW}📝 Note:${NC} Make sure your dev server is running on ${LOCAL_URL}"
echo ""
echo -e "${BLUE}Starting webhook forwarding...${NC}"
echo "Press Ctrl+C to stop"
echo ""

# Forward webhooks
stripe listen --forward-to "${WEBHOOK_ENDPOINT}"

