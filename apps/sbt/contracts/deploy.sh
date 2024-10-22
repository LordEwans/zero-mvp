#!/bin/bash

source .env

if [ -z "$CID" ]; then
    echo "CID is not set. Please set it in .env"
    exit 1
fi

if [ -z "$RPC_URL" ]; then
    echo "RPC URL is not set. Please set it in .env"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "PRIVATE_KEY is not set. Please set it in .env"
    exit 1
fi

if [ -z "$API_URL" ]; then
    echo "API_URL is not set. Please set it in .env"
    exit 1
fi

forge install

forge script script/Deployer.s.sol \
    "$CID" \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --sig "run(string _cid)"