#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTRACT_ADDRESS="0x008484085F02c25C8d82A5Db5aFBA6e1151e24f1"
CONTRACT_PATH="./src/OMID.sol:OMID"
CHAIN_ID="2810"

# Function to check if a variable is set
check_env() {
    local var_name="$1"
    local var_value="$2"
    if [ -z "$var_value" ]; then
        echo -e "${RED}Error: ${var_name} is not set. Please set it in .env${NC}"
        exit 1
    fi
}

# Function to show spinner while waiting
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Check required environment variables
check_env "API_KEY" "$API_KEY"
check_env "RPC_URL" "$RPC_URL"
check_env "API_URL" "$API_URL"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
forge install

# Verify contract
echo -e "${YELLOW}Starting contract verification...${NC}"
forge verify-contract \
    --rpc-url "$RPC_URL" \
    "$CONTRACT_ADDRESS" \
    "$CONTRACT_PATH" \
    --verifier-url "$API_URL" \
    --watch &

# Show spinner while verification is in progress
spinner $!

# Check verification status
echo -e "${YELLOW}Checking verification status...${NC}"
forge verify-check "$CONTRACT_ADDRESS" \
    --chain "$CHAIN_ID" \
    --verifier-url "$API_URL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Verification completed successfully!${NC}"
else
    echo -e "${RED}Verification failed. Please check the error messages above.${NC}"
    exit 1
fi