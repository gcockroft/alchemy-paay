# Outlines Steps

1. Deploys the Badges Contract (Not Paused)
   _Make sure to grab the address from step to feed into step 2_

```bash
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/AlchemyBadges.sol:AlchemyBadges --constructor-args "false"
```

2. Deploy the Badges Operator Contract
   _Make sure to grab the address from step to feed into step 6_

```bash
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/AlchemyBadgesOperator.sol:AlchemyBadgesOperator --constructor-args "$BADGES_CONTRACT_ADDRESS"
```

3. Add these addresses to the changelog.md file.

4. Create Main Mint Pass Contract

```bash
cast send $BADGES_CONTRACT_ADDRESS "setBadgeSpec(uint256, string, bool, bool)" 1 "https://s3.amazonaws.com/static.fam.corp.alchemyapi.io/badges/mintpass.json" true true --private-key $PRIVATE_KEY --rpc-url $RPC_URL

cast send $BADGES_CONTRACT_ADDRESS "setMintPass(uint256)" 1 --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

5. Create Account Abscrabtor Badge

```bash
cast send $BADGES_CONTRACT_ADDRESS "setBadgeSpec(uint256, string, bool, bool)" 2 "https://s3.amazonaws.com/static.fam.corp.alchemyapi.io/badges/crab.json" true true --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

6. Update the badge counter for the new value 2

```bash
cast send $BADGES_CONTRACT_ADDRESS "setBadgeCounter(uint256)" 2 --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

7. Add the operator contract as an executor of the badges contract

```bash
contracts % cast send $BADGES_CONTRACT_ADDRESS "setExecutor(address, bool)" $BADGES_OPERATOR_ADDRESS true --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```
