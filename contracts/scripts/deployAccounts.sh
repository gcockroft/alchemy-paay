#!/bin/bash

# Example Usage
# ./deployAccounts.sh "YOUR_RPC_URL" "--private-key YOUR_PRIVATE_KEY" ./migrations/accounts-polygon-mumbai.md "A deployment update summary"

RPC_URL="$1"
SIGNER_METHOD="$2"
ACCOUNT_FACTORY_ADDRESS=""
ELIPTIC_CURVE_ADDRESS=""
ENTRY_POINT_ADDRESS=""
DEPLOYER_ADDRESS=""
CHANGES_FILE=$3
CHANGELOG_MESSAGE="$4"


# Function to add deployment information to the changelog
add_deployment_info() {
    local contract_name=$1
    local deployed_to=$2
    local tx_hash=$3
    local deployer=$4

    echo "" >> $CHANGES_FILE
    echo "## $contract_name Deploy" >> $CHANGES_FILE
    echo "- Deployer: $deployer" >> $CHANGES_FILE
    echo "- Deployed to: $deployed_to" >> $CHANGES_FILE
    echo "- Transaction hash: $tx_hash" >> $CHANGES_FILE
}

# Step 1: Deploy Curve
echo "Deploying Passkey Account Factory..."
epliptic_curve=$(forge create --rpc-url $RPC_URL $SIGNER_METHOD src/accounts/Secp256r1.sol:Secp256r1)
ELIPTIC_CURVE_ADDRESS=$(echo $epliptic_curve | sed -nE 's/.*Deployed to: (0x[[:alnum:]]+).*/\1/p')
epliptic_curve_tx_hash=$(echo $epliptic_curve | sed -nE 's/.*Transaction hash: (0x[[:alnum:]]+).*/\1/p')
DEPLOYER_ADDRESS=$(echo $epliptic_curve | sed -nE 's/.*Deployer: (0x[[:alnum:]]+).*/\1/p')
echo "Deployed Badges Contract to $ELIPTIC_CURVE_ADDRESS!"

# Step 2: Get supported entry point from rpc call
echo "Getting supported entry point..."
entry_point=$(cast rpc eth_supportedEntryPoints --rpc-url $RPC_URL)
echo "Supported entry point: $entry_point"
## Grab the first address via regex from the output which looks like this: ["0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"]
ENTRY_POINT_ADDRESS=$(echo $entry_point | sed -nE 's/.*\[\"(0x[[:alnum:]]+)\"\].*/\1/p')
echo "Retreived Contract to $ENTRY_POINT_ADDRESS!"

# Step 3: Deploy the Badges Contract
echo "Deploying Passkey Account Factory..."
account_factory=$(forge create --rpc-url $RPC_URL $SIGNER_METHOD src/accounts/PasskeyAccountFactory.sol:PasskeyAccountFactory --constructor-args $ENTRY_POINT_ADDRESS $ELIPTIC_CURVE_ADDRESS)
ACCOUNT_FACTORY_ADDRESS=$(echo $account_factory | sed -nE 's/.*Deployed to: (0x[[:alnum:]]+).*/\1/p')
contract_tx_hash=$(echo $account_factory | sed -nE 's/.*Transaction hash: (0x[[:alnum:]]+).*/\1/p')
DEPLOYER_ADDRESS=$(echo $account_factory | sed -nE 's/.*Deployer: (0x[[:alnum:]]+).*/\1/p')
echo "Deployed Badges Contract to $ACCOUNT_FACTORY_ADDRESS!"

# Step 4: Add addresses to the changelog.md file
echo "" >> $CHANGES_FILE
echo "# $(date +"%m/%d/%y") - $CHANGELOG_MESSAGE" >> $CHANGES_FILE
add_deployment_info "Account Factory Deploy" $ACCOUNT_FACTORY_ADDRESS $contract_tx_hash $DEPLOYER_ADDRESS
echo "Added addresses to the changelog.md file!"

# Complete
echo "Deployment complete!"
echo "Retreived Entrypoint Address: $ENTRY_POINT_ADDRESS!"
echo "- Retreived Entrypoint Address: $ENTRY_POINT_ADDRESS!" >> $CHANGES_FILE

echo "Account Factory Address: $ACCOUNT_FACTORY_ADDRESS"
echo "- Account Factory Address: $ACCOUNT_FACTORY_ADDRESS" >> $CHANGES_FILE

echo "Account Factory Txn: $contract_tx_hash"
echo "- Account Factory Txn: $contract_tx_hash" >> $CHANGES_FILE


echo "Epliptic Curve Address: $ELIPTIC_CURVE_ADDRESS"
echo "- Epliptic Curve Address: $ELIPTIC_CURVE_ADDRESS" >> $CHANGES_FILE

echo "Epliptic Curve Txn: $epliptic_curve_tx_hash"
echo "- Epliptic Curve Txn: $epliptic_curve_tx_hash" >> $CHANGES_FILE


echo "Deployer Address: $DEPLOYER_ADDRESS"
echo "- Deployer Address: $DEPLOYER_ADDRESS" >> $CHANGES_FILE

echo "Changelog in: $CHANGES_FILE"
