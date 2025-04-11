import {
      makeContractCall,
      broadcastTransaction,
      contractPrincipalCV,
      callReadOnlyFunction,
      Cl,
      uintCV,
      someCV,
      PostConditionMode,
    } from "@stacks/transactions";

    const tokenXAddress = "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM"; 
    const tokenXContract = "token-wstx-v2";
    const tokenYAddress = "SP2SF8P7AKN8NYHD57T96C51RRV9M0GKRN02BNHD2"; 
    const tokenYContract = "token-wstone";
    const factorX = 100000000;  
    const DECIMALS = 1000000;


async function getConvertedAmount(fromCoin, toCoin, amount) {
  const url = `https://dev-api-wallet.stonezone.gg/coin/convert/${fromCoin}/${toCoin}/${amount}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Converted ${amount} ${fromCoin.toUpperCase()} to ${data.output} ${toCoin.toUpperCase()}`);
    return data.output;
  } catch (error) {
    console.error('Error fetching conversion:', error);
  }
}

// Example: Convert 1 SOL to STX
// getConvertedAmount('sol', 'stx', 1);

export async function executeSwapCalculation(solAmount) {try {

      const stxAmount = await getConvertedAmount('sol', 'stx', solAmount);
      if (!stxAmount) throw new Error("STX conversion failed");
      const microStxAmount = Math.floor(stxAmount * 1000000);

      const txOptions1 = {
            
      contractAddress: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM',
      contractName: 'amm-pool-v2-01',
      functionName: 'get-helper',
      functionArgs: [
        contractPrincipalCV(tokenXAddress, tokenXContract), 
        contractPrincipalCV(tokenYAddress, tokenYContract),
        Cl.uint(factorX),  
        Cl.uint(microStxAmount), 
      ],
      network: 'mainnet',
      senderAddress: "SPXWGJQ101N1C1FYHK64TGTHN4793CHVKTJAT7VQ",
    };
    const stoneResult = await callReadOnlyFunction(txOptions1);
    const stoneAmountRaw = BigInt(stoneResult.value.value); // Extract raw ALEX amount
    const stoneAmount = Number(stoneAmountRaw) / Number(DECIMALS); // Convert to human-readable format
    console.log(`✅ Final stone Received: ${stoneAmount} stone`);
    return stoneAmount;

  } catch (error) {
    console.error("❌ Error executing swap calculation:", error);
  }
}
// executeSwapCalculation(0.001);

    