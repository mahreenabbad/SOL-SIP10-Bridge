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


    
 async function executeSwapCalculation(stoneAmount) {try {
          
      const txOptions1 = {
            
      contractAddress: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM',
      contractName: 'amm-pool-v2-01',
      functionName: 'get-helper',
      functionArgs: [
            contractPrincipalCV(tokenYAddress, tokenYContract), 
            contractPrincipalCV(tokenXAddress, tokenXContract),
        Cl.uint(factorX),  
        Cl.uint(stoneAmount), 
      ],
      network: 'mainnet',
      senderAddress: "SPXWGJQ101N1C1FYHK64TGTHN4793CHVKTJAT7VQ",
};
const stxResult = await callReadOnlyFunction(txOptions1);
const stxAmountRaw = BigInt(stxResult.value.value); // Extract raw ALEX amount
const stxAmount = Number(stxAmountRaw) / Number(DECIMALS); // Convert to human-readable format
console.log(`✅ Final stx Received: ${stxAmount} stx`);
return stxAmount;

} catch (error) {
      console.error("❌ Error executing swap calculation:", error);
  }
}
// executeSwapCalculation(10000000);

export async function getConvertedAmount( amount) {

      const stxAmount = await executeSwapCalculation(amount * DECIMALS);
    
      if (!stxAmount) {
        throw new Error("STX conversion failed");
      }
  const url = `https://dev-api-wallet.stonezone.gg/coin/convert/stx/sol/${stxAmount}`;

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
    console.log(`Converted ${stxAmount} STX to ${data.output} SOL`);
    return data.output;
  } catch (error) {
    console.error('Error fetching conversion:', error);
  }
}


      
// Example: Convert 1 SOL to STX
// getConvertedAmount(10);
