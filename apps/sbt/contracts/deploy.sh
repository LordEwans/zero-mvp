#!/bin/bash

# Exit on error
set -e

source .env

# Check required environment variables
for var in CID RPC_URL PRIVATE_KEY API_URL API_KEY; do
    if [ -z "${!var}" ]; then
        echo "$var is not set. Please set it in .env"
        exit 1
    fi
done

forge install

forge script script/Deployer.s.sol \
    "$CID" \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$API_KEY" \
    --verifier-url "$API_URL" \
    --sig "run(string _cid)"
