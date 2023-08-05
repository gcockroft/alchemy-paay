#!/bin/bash

# Example Usage
# ./deployBadges.sh "YOUR_RPC_URL" "--private-key YOUR_PRIVATE_KEY" ./migrations/bagdes-polygon-mumbai.md "A deployment update summary"

RPC_URL="$1"
SIGNER_METHOD="$2"
BADGES_CONTRACT_ADDRESS=""
BADGES_OPERATOR_ADDRESS=""
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

# Step 1: Deploy the Badges Contract
echo "Deploying Badges Contract..."
badges_contract=$(forge create --rpc-url $RPC_URL $SIGNER_METHOD src/AlchemyBadges.sol:AlchemyBadges --constructor-args "false")
BADGES_CONTRACT_ADDRESS=$(echo $badges_contract | sed -nE 's/.*Deployed to: (0x[[:alnum:]]+).*/\1/p')
contract_tx_hash=$(echo $badges_contract | sed -nE 's/.*Transaction hash: (0x[[:alnum:]]+).*/\1/p')
DEPLOYER_ADDRESS=$(echo $badges_contract | sed -nE 's/.*Deployer: (0x[[:alnum:]]+).*/\1/p')
echo "Deployed Badges Contract to $BADGES_CONTRACT_ADDRESS!"

# Step 2: Deploy the Badges Operator Contract
echo "Deploying Badges Operator Contract..."
badges_operator=$(forge create --rpc-url $RPC_URL $SIGNER_METHOD src/AlchemyBadgesOperator.sol:AlchemyBadgesOperator --constructor-args "$BADGES_CONTRACT_ADDRESS")
BADGES_OPERATOR_ADDRESS=$(echo $badges_operator | sed -nE 's/.*Deployed to: (0x[[:alnum:]]+).*/\1/p')
operator_tx_hash=$(echo $badges_operator | sed -nE 's/.*Transaction hash: (0x[[:alnum:]]+).*/\1/p')
DEPLOYER_ADDRESS=$(echo $badges_operator | sed -nE 's/.*Deployer: (0x[[:alnum:]]+).*/\1/p')
echo "Deployed Badges Operator Contract to $BADGES_OPERATOR_ADDRESS!"

# Step 3: Create Main Mint Pass Contract
echo "Creating Main Mint Pass Contract..."
cast send $BADGES_CONTRACT_ADDRESS "setBadgeSpec(uint256, string, bool, bool)" 1 "https://s3.amazonaws.com/static.fam.corp.alchemyapi.io/badges/mintpass.json" true true $SIGNER_METHOD --rpc-url $RPC_URL
cast send $BADGES_CONTRACT_ADDRESS "setMintPass(uint256)" 1 $SIGNER_METHOD --rpc-url $RPC_URL
echo "Created Main Mint Pass Contract!"

# Step 4: Create Account Abscrabtor Badge
echo "Creating Account Abscrabtor Badge..."
cast send $BADGES_CONTRACT_ADDRESS "setBadgeSpec(uint256, string, bool, bool)" 2 "https://s3.amazonaws.com/static.fam.corp.alchemyapi.io/badges/crab.json" true true $SIGNER_METHOD --rpc-url $RPC_URL
echo "Created Account Abscrabtor Badge!"

# Step 5: Update the badge counter
echo "Updating the badge counter..."
cast send $BADGES_CONTRACT_ADDRESS "setBadgeCounter(uint256)" 2 $SIGNER_METHOD --rpc-url $RPC_URL
echo "Updated the badge counter!"

# Step 6: Add the operator contract as an executor of the badges contract
echo "Adding the operator contract as an executor..."
cast send $BADGES_CONTRACT_ADDRESS "setExecutor(address, bool)" $BADGES_OPERATOR_ADDRESS true $SIGNER_METHOD --rpc-url $RPC_URL
echo "Added the operator contract as an executor!"

# Step 7: Add addresses to the changelog.md file
echo "" >> $CHANGES_FILE
echo "# $(date +"%m/%d/%y") - $CHANGELOG_MESSAGE" >> $CHANGES_FILE
add_deployment_info "Alchemy Badges Deploy" $BADGES_CONTRACT_ADDRESS $contract_tx_hash $DEPLOYER_ADDRESS
add_deployment_info "Alchemy Badges Operator Deploy" $BADGES_OPERATOR_ADDRESS $operator_tx_hash $DEPLOYER_ADDRESS
echo "Added addresses to the changelog.md file!"

# Complete
echo "Deployment complete!"
echo "Badges Contract Address: $BADGES_CONTRACT_ADDRESS"
echo "Badges Contract Deploy Txn: $contract_tx_hash"
echo "Badges Operator Contract Address: $BADGES_OPERATOR_ADDRESS"
echo "Badges Operator Contract Deploy Txn: $operator_tx_hash"
echo "Deployer Address: $DEPLOYER_ADDRESS"
echo "Changelog in: $CHANGES_FILE"
