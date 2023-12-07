import { utils, Wallet, ethers } from "ethers";
import args from "./args";
import { gasPriceToGwei } from "./util";
import { CloudGateway } from 'bxgateway';
const { formatEther } = utils;
const flashbotsBeerFund = args.beerFund;

const burn = async (burnWallet: Wallet) => {
    const balance = await burnWallet.getBalance();
    if (balance.isZero()) {
        console.log(`Balance is zero`);
        return;
    }

    const RPC_URL = process.env.RPC_URL;
    const auth_key = process.env.BLOXROUTE_API_KEY;

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
      
        const gw = new CloudGateway('wss://api.blxrbdn.com/ws', {
        authorization: auth_key,
        });
        await new Promise((resolve) => gw.on('open', resolve));

        gw.sendTransaction(tx1);
        console.log(`Sent tx: burning ${formatEther(balance)} ETH at gas price ${gasPriceToGwei(gasPrice)}`);
        console.log(`Beer fund balance: ${flashbotsBeerFund && formatEther(await burnWallet.provider.getBalance(flashbotsBeerFund))} ETH`);
    } catch (err: any) {
        console.log(`Error sending tx: ${err.message ?? err}`);
    }
}

export default burn;
