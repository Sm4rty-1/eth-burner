import { utils, Wallet, ethers } from "ethers";
import args from "./args";
import { gasPriceToGwei } from "./util";
require("dotenv").config();
import { CloudGateway } from 'bxgateway';
const axios = require('axios');

const { formatEther } = utils;
const flashbotsBeerFund = args.beerFund;
const RPC_URL = process.env.rpc_url;
const auth_key = process.env.bloxroute_api;


const gw = new CloudGateway('wss://api.blxrbdn.com/ws', {
    authorization: auth_key,
    });

const burn = async (burnWallet: Wallet) => {
    const balance = await burnWallet.getBalance();
    if (balance.isZero()) {
        console.log(`Balance is zero`);
        return;
    }

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const raw_gasPrice = await provider.getGasPrice();
    
    const gasPrice = raw_gasPrice.mul(12).div(10); // Change it accordingly. For example 25 means 2.5X

    if (balance.lt(gasPrice.mul(21000))) {
        console.log(`Balance too low to burn (balance=${formatEther(balance)} gasPrice=${gasPriceToGwei(gasPrice)}) gwei`);
        return;
    }
    
    // Calculate leftovers after deducting gas cost
    const leftovers = balance.sub(gasPrice.mul(21000));
    console.log(`Leftovers: ${formatEther(leftovers)} ETH`);

    try {
        console.log(`Burning ${formatEther(balance)}`);
        const transaction1 = {
            chainId: 1, 
            to: flashbotsBeerFund,
            value: leftovers, 
            gasPrice: gasPrice, 
            gasLimit: 21000,
            nonce: await burnWallet.getTransactionCount(),
          };
        const tx1 = await burnWallet.signTransaction(transaction1);
      
        const requestData = {
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_sendPrivateRawTransaction',
            params: [tx1],
          };
        
          const [rsyncResponse, lightspeedbuilderResponse, beaverbuildResponse] = await Promise.all([
            axios.post('https://rsync-builder.xyz', requestData),
            axios.post('https://rpc.lightspeedbuilder.info/', requestData),
            axios.post('https://rpc.beaverbuild.org/', requestData),
          ]);
          
            await new Promise((resolve) => gw.on('open', resolve));
            gw.sendTransaction(tx1);
        
        console.log(`Sent tx: burning ${formatEther(balance)} ETH at gas price ${gasPriceToGwei(gasPrice)}`);
        console.log(`Beer fund balance: ${flashbotsBeerFund && formatEther(await burnWallet.provider.getBalance(flashbotsBeerFund))} ETH`);
    } catch (err: any) {
        console.log(`Error sending tx: ${err.message ?? err}`);
    }
}

export default burn;
