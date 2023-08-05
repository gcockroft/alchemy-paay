# Contract Development

1. Install Rust by going [here](https://rustup.rs/)
2. Install forge by running

```bash
cargo install --git https://github.com/gakonst/foundry --locked
```

3. Then in the `contract` directory run `forge build` to make sure everything compiles.

_For information on Foundry, Forge, and Cast see https://onbjerg.github.io/foundry-book/index.html_

# Build the Contract

Within a contract folder run:
`forge build`

Once built make sure to copy the respective contract abi from the out directory into `/src/contracts/abi`
for imports into abi json files into any clients.

# Test Contracts

Within a contract folder run

```bash
forge test
# Emit logs to the console
forge test -vv
# Run tests with state seeded from a live Ethereum network. Use node url
forge test  --fork-url https://polygon-mumbai.g.alchemy.com/v2/Uso...
```

# Deploy Contract

Within a contract folder run

```bash
forge create --rpc-url <ALCHEMY_RPC_URL> --private-key <YOUR_PRIVATE_KEY> <CONTRACT_LOCATION>:<CONTRACT_NAME> --constructor-args "arg1" "arg2"

# Example
forge create --rpc-url https://polygon-mumbai.g.alchemy.com/v2/... --private-key 155... src/AlchemyEmployeeMint.sol:AlchemyEmployeeMint --constructor-args "baseURI" "collectionURI"
```
