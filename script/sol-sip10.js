// import { Connection, 
//             PublicKey, 
//             Transaction, 
//             SystemProgram, 
//             sendAndConfirmTransaction,
//             Keypair,
//             clusterApiUrl
//             } from '@solana/web3.js';
// import bs58 from "bs58";
// import{ Cl,
//   makeContractCall, 
//   broadcastTransaction,
//   PostConditionMode,
//   principalCV,
//   contractPrincipalCV,
//   Pc
// } from '@stacks/transactions';
// import fs from 'fs';
// // import idl from "./bridge-program-id.json";
// import * as anchor from "@project-serum/anchor";
// import { web3 , Program, AnchorProvider} from "@project-serum/anchor";
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { BN } from "bn.js";


//  const BRIDGE_PROGRAM_ID = new PublicKey('5YQSkQUR9SWLLdRQehQaUqeGzvF22as3SvrKSr6983aV');
// const SIP10_TOKEN_MINT = new PublicKey('7A8w18Ym1yoaARPpJLvRYtXCD7woaorBKtJCnFR3MGde'); // Replace with your SIP-10 token mint
// // const STACKS_RECIPIENT = 'STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV'; // Replace with recipient Stacks address
// const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
// const BRIDGE_VAULT_PDA = new PublicKey('4emik8wNoKAP9MZ6cQhdNRcaHJRhKxAMGv3hSMYkKSd8'); // Replace with your bridge vault address
// const STACKS_BRIDGE_ADDRESS = 'STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV';
// const STACKS_BRIDGE_NAME ='bridge004'
// const base58SecretKey = "3M7dw9Rzug9SyRaon3GGZCWvLmGYdKy1ag9KG7NVcCd8JVV6YE25NuV35cz6zZ3Gw7B7nZoVEkHQXse9BarSnaxQ";

// // Convert to Uint8Array
// const secretKeyUint8 = bs58.decode(base58SecretKey);

// // Load Keypair
// const solanaWallet = Keypair.fromSecretKey(secretKeyUint8);


// async function lockSol() {
// //     // Part 1: Lock SOL on Solana
//      const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');
    
//     // Create instruction to lock SOL
          
//               const transaction = new Transaction().add(
//                   SystemProgram.transfer({
//                       fromPubkey: solanaWallet.publicKey,
//                       toPubkey: BRIDGE_VAULT_PDA,
//                       lamports: 1 * 1e9 
//                   })
//               );
      
//               // Send transaction
//               const txSignature = await sendAndConfirmTransaction(solanaConnection, transaction, [solanaWallet]);
//               console.log("✅ SOL Transferred! Transaction Signature:", txSignature);
//                // Step 2: Set up confirmation listener
//   const confirmation = await solanaConnection.confirmTransaction(
//       txSignature,
//       'confirmed'
//     );
  
//     if (confirmation.value.err) {
//       throw new Error('❌ SOL Lock Failed');
//     }

//     console.log('✅ SOL Lock Confirmed!');
//     return txSignature;
//   }

// // unlock sip10
//   const receipient =principalCV("ST11SKCKNE62GT113W5GZP4VNB47536GFH9QWNJW2")
//   const sip10Amount = Cl.uint(1000000)
//   const tokenTrait = contractPrincipalCV(
//       "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
//       "stone-token") 

// async function UnlockSip10( ) {
//     // Part 2: Unlock SIP-10 tokens on Stacks
//     const stacksNetwork ='testnet';
    
//     const unlockOptions = {
//         contractAddress: STACKS_BRIDGE_ADDRESS,
//         contractName: STACKS_BRIDGE_NAME,
//         functionName: 'unlock',
//         functionArgs: [
//             sip10Amount, // 1:1 ratio
//             receipient,
//             tokenTrait ],
//             // anchorMode: 3,
//       postConditionMode: PostConditionMode.Allow,
//         senderKey: '3a020135ad063d66f11c1b6e1e1d2b2a46cf99e721dde23c70463dca132eaaec01',
//         validateWithAbi: true,
//         network: stacksNetwork,
//         fee: 2000n,
      
//     };
   
//     const unlockTx = await makeContractCall(unlockOptions);
//     const unlockTxId = await broadcastTransaction(unlockTx, stacksNetwork);
    
//     console.log("SIP-10 tokens unlocked successfully. Tx hash:", unlockTxId);
//     return unlockTxId;
// }


// async function executeBridge() {
//       try {
//         // 1. Lock SOL and wait for confirmation
//         const txSignature = await lockSol();
        
//         // 2. Set up real-time confirmation listener (alternative approach)
//         const solanaConnection = new Connection(SOLANA_RPC_URL);
//         solanaConnection.onSignature(txSignature, async (result) => {
//           if (result.err) {
//             console.error('❌ SOL Lock Failed (Event)');
//             return;
//           }
          
//           // 3. Automatically trigger unlock
//           try {
//             await UnlockSip10();
//             console.log('🎉 Bridge Process Completed!');
//           } catch (error) {
//             console.error('❌ SIP-10 Unlock Failed:', error);
//           }
//         }, 'confirmed');
    
//       } catch (error) {
//         console.error('🔴 Bridge Process Failed:', error);
//       }
//     }
//     executeBridge();
    ///////////////////////
import { 
  Connection, 
  PublicKey,
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction, 
  Keypair 
} from '@solana/web3.js';
import bs58 from "bs58";
import { 
     Cl, 
     makeContractCall, 
     broadcastTransaction, 
     PostConditionMode, 
     principalCV, 
     contractPrincipalCV 
    } from '@stacks/transactions';
import {executeSwapCalculation} from "./sol-stone.js"


// Configuration
// const BRIDGE_PROGRAM_ID = new PublicKey('5YQSkQUR9SWLLdRQehQaUqeGzvF22as3SvrKSr6983aV');
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
// const BRIDGE_VAULT_PDA = new PublicKey('4emik8wNoKAP9MZ6cQhdNRcaHJRhKxAMGv3hSMYkKSd8');
const BRIDGE_VAULT_PDA = new PublicKey('APqctvRGYBXxgasti2vu6umGGpFqZN2bZnQSxeXG7GPS');

const STACKS_BRIDGE_ADDRESS = 'STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV';
const STACKS_BRIDGE_NAME = 'bridge004';
const base58SecretKey = "3M7dw9Rzug9SyRaon3GGZCWvLmGYdKy1ag9KG7NVcCd8JVV6YE25NuV35cz6zZ3Gw7B7nZoVEkHQXse9BarSnaxQ";

// Conversion rate (1 SOL = 10 SIP10 tokens)
const SOL_TO_SIP10_RATIO = 10;
const LAMPORTS_PER_SOL = 1000000000; // 1 SOL = 1,000,000,000 lamports

// Convert to Uint8Array and load Keypair
const secretKeyUint8 = bs58.decode(base58SecretKey);
const solanaWallet = Keypair.fromSecretKey(secretKeyUint8);

async function lockSol(solAmount) {
    const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const lamports = solAmount * LAMPORTS_PER_SOL;

    console.log(`🔒 Attempting to lock ${solAmount} SOL (${lamports} lamports)...`);
    
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: solanaWallet.publicKey,
            toPubkey: BRIDGE_VAULT_PDA,
            lamports: lamports
        })
    );

    // Send transaction
    console.log("⏳ Sending SOL lock transaction...");
    const txSignature = await sendAndConfirmTransaction(solanaConnection, transaction, [solanaWallet]);
    
    console.log("✅ SOL Locked Successfully!");
    console.log("📝 Transaction Signature: ",txSignature);

    // Wait for confirmation
    console.log("⏳ Waiting for transaction confirmation...");
    const confirmation = await solanaConnection.confirmTransaction(txSignature, 'confirmed');
    
    if (confirmation.value.err) {
        throw new Error('❌ SOL Lock Failed - Transaction Error');
    }

    console.log('✅ SOL Lock Confirmed on-chain!');
    const sip10Amount = await executeSwapCalculation(solAmount);
    return {
        txSignature,
        solAmount,
        sip10Amount: sip10Amount
    };
}

async function unlockSip10(lockDetails) {
    const stacksNetwork = 'testnet';
    const sip10Amount = Cl.uint(lockDetails.sip10Amount * 1000000); // Convert to micro-tokens
    
    console.log(`🔓 Attempting to unlock ${lockDetails.sip10Amount} SIP10 tokens...`);
    console.log(`💎 Conversion Rate: 1 SOL = ${SOL_TO_SIP10_RATIO} SIP10 tokens`);

    const unlockOptions = {
        contractAddress: STACKS_BRIDGE_ADDRESS,
        contractName: STACKS_BRIDGE_NAME,
        functionName: 'unlock',
        functionArgs: [
            sip10Amount,
            principalCV("ST11SKCKNE62GT113W5GZP4VNB47536GFH9QWNJW2"),
            contractPrincipalCV(STACKS_BRIDGE_ADDRESS, "stone-token")
        ],
        postConditionMode: PostConditionMode.Allow,
        senderKey: '3a020135ad063d66f11c1b6e1e1d2b2a46cf99e721dde23c70463dca132eaaec01',
        validateWithAbi: true,
        network: stacksNetwork,
        fee: 2000n,
    };

    console.log("⏳ Building SIP10 unlock transaction...");
    const unlockTx = await makeContractCall(unlockOptions);
    
    console.log("⏳ Broadcasting transaction to Stacks network...");
    const unlockTxId = await broadcastTransaction(unlockTx, stacksNetwork);
    
    console.log("✅ SIP-10 Tokens Unlocked Successfully!");
    console.log("📝 Transaction ID:", unlockTxId);
    
    return unlockTxId;
}

async function executeBridge() {
    try {
        console.log("🌉 Starting Bridge Process...");
        
        // 1. Lock SOL (1 SOL in this example)
        const lockDetails = await lockSol(0.001);
        
        // 2. Automatically trigger unlock
        console.log("\n⏳ Triggering SIP10 unlock based on SOL lock...");
        await unlockSip10(lockDetails);
        
        console.log('\n🎉 Bridge Process Completed Successfully!');
        console.log(`🔒 SOL Locked: ${lockDetails.solAmount}`);
        console.log(`🔓 SIP10 Unlocked: ${lockDetails.sip10Amount}`);
        
    } catch (error) {
        console.error('\n🔴 Bridge Process Failed:', error.message || error);
        process.exit(1);
    }
}

// Run the bridge
executeBridge();