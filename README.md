# eth-burner (Modified to send txns using mev builders)

Watches each block for a balance update, and if one is detected, burns all that ETH by transferring ETH with the highest possible transaction fee, effectively burning it from the account.

Technically, the ETH is not actually burned (permanently erased). It's just collected by miners :)

The script is using Bloxroute for sending txns. Add Bloxroute api and rpc_url to the the env file. 
```
bloxroute_api='YOUR_BLOXROUTE_API'
rpc_url='https://eth-mainnet.g.alchemy.com/v2/API_KEY'
```

## wanna burn?

```sh
# only do this once
yarn install

# burn eth in account corresponding to given prvkey
yarn start -k <private_key> -b <address_to_receive_fund> # OPTIONAL address to receive un-burnable leftovers, defaults to 0xfb000000387627910184cc42fc92995913806333
```


_If you want to test this out without burning real ETH, use a testnet provider or a hardhat fork with url `http://localhost:8545`.