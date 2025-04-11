// import { Connection,
//         PublicKey,
//         Transaction,
//         SystemProgram,
//         sendAndConfirmTransaction,
//         Keypair } from '@solana/web3.js';
import "dotenv/config";

// import { BN } from "bn.js";
import bs58 from "bs58";
// import {  makeContractCall,
//     Cl,
//     contractPrincipalCV,
//     broadcastTransaction,
//     PostConditionMode } from '@stacks/transactions';

// Configuration - replace these with your actual valuesconst SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const BRIDGE_VAULT_PDA = new PublicKey(
  "APqctvRGYBXxgasti2vu6umGGpFqZN2bZnQSxeXG7GPS"
); // Replace with your bridge vault address
const STACKS_BRIDGE_ADDRESS = "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV";
const STACKS_BRIDGE_NAME = "bridge004";
const base58SecretKey = "secret key";
const secretKeyUint8 = bs58.decode(base58SecretKey);
const SOLANA_RPC_URL = "https://api.devnet.solana.com";
const SOL_RECIPIENT = new PublicKey(
  "GoE3DAzPgseGUFAn9ufQjgKdQ1jAoL6LUtgMEzmN9EZ7"
); // Replace with recipient Solana address
const BRIDGE_AUTHORITY_PRIVATE_KEY = "DUMMY_BRIDGE_AUTHORITY_PRIVATE_KEY"; // Replace with your bridge authority private key

// Load Keypair
// const solanaWallet = Keypair.fromSecretKey(secretKeyUint8);

// async function lockSip10() {
//     // Part 1: Lock SIP-10 tokens on Stacks
//     const stacksNetwork = 'testnet';
//     const sip10Amount = Cl.uint(1000000)
// const tokenTrait = contractPrincipalCV(
//       "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
//       "stone-token"
//     )

//     const lockOptions = {
//         contractAddress: STACKS_BRIDGE_ADDRESS,
//         contractName: STACKS_BRIDGE_NAME,
//         functionName: 'lock',
//         functionArgs: [sip10Amount,tokenTrait],
//         senderKey: "private key",
//         validateWithAbi: true,
//         network: stacksNetwork,
//          postConditionMode: PostConditionMode.Allow,
//         fee: 2000n,

//     };

//     const lockTx = await makeContractCall(lockOptions);
//     const lockTxId = await broadcastTransaction(lockTx, stacksNetwork);

//     console.log("SIP-10 tokens locked successfully. Tx hash:",lockTxId);
// }
// lockSip10()

// Part 2: Unlock SOL on Solana
//    async function unlockSol() {
//           const bridgeVaultWallet = Keypair.fromSecretKey(
//           Uint8Array.from(JSON.parse(process.env.BRIDGE_AUTHORITY_PRIVATE_KEY
// )));
//    const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');

//       // Create instruction to lock SOL
//                 const transaction = new Transaction().add(
//                     SystemProgram.transfer({
//                         fromPubkey:BRIDGE_VAULT,
//                         toPubkey:  SOL_RECIPIENT,
//                         lamports: 1 * 1e9 // 1 SOL (in lamports)
//                     })
//                 );

//                 // Send transaction
// const txSignature = await sendAndConfirmTransaction(solanaConnection, transaction, [BRIDGE_VAULT]);
// console.log("✅ SOL Transferred! Transaction Signature:", txSignature);
//     // Step 2: Set up confirmation listener
//     // Invoke your program's unlock instruction
// const tx = await program.methods
// .unlock(new BN(amount))
// .accounts({
//   bridgeVault: BRIDGE_VAULT,
//   recipient: SOL_RECIPIENT,
//   authority: bridgeAuthorityPubkey,
// })
// .rpc();
//   const confirmation = await solanaConnection.confirmTransaction(
//       txSignature,
//       'confirmed'
//     );
//    console.log("unlock sol successfully",confirmation);
// }
// unlockSol()
/////////////////////////////
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, Wallet } from "@project-serum/anchor";
import anchor from "@project-serum/anchor";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// 👇 This replicates __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idlPath = path.join(__dirname, "../script/id1.json");

const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

// console.log("idl for program",idl);
// Configuration
const programId = new PublicKey("BrqvbtST215rkLD1fyzj7p5j7tcVGoQPZ4T39GtkGttg");
const CLUSTER_URL = "https://api.devnet.solana.com"; // or your localnet/mainnet URL
const connection = new Connection(CLUSTER_URL, "confirmed");

// Initialize provider with wallet
// const wallet = Keypair.generate(); // Replace with your actual wallet
const userKeypair = Keypair.fromSecretKey(secretKeyUint8);
const userWallet = new Wallet(userKeypair);
const provider = new AnchorProvider(connection, userWallet, {});
const program = new Program(idl, programId, provider);

// Initialize the bridge PDA (run once)
// async function initializePDA() {
// try {

const [pda, bump] = await PublicKey.findProgramAddress(
  [Buffer.from("bridge-vault")],
  programId
);

// const tx = await program.methods.initialize()
//     .accounts({
//         pdaAccount: pda,
//         user: userWallet.publicKey,
//         systemProgram: SystemProgram.programId,
//     })
//     .signers([userWallet])
//     .rpc();

// console.log("Bridge initialized. Tx:", tx);
// console.log('PDA account:', pda.toString());
//     console.log('Bump:', bump);
// return { pda, bump };
// } catch (error) {
//     console.error("error initializing PDA",error);
// }
// }

// Unlock SOL from the bridge

async function unlockSol(amount) {
  try {
    // const [pda, bump]  = await initializePDA();

    const tx = await program.methods
      .unlock(new anchor.BN(amount))
      .accounts({
        pda,
        recipient: SOL_RECIPIENT,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const txHash = await provider.sendAndConfirm(tx);
    console.log("Success! Transaction hash:", txHash);
    return txHash;
  } catch (error) {
    console.error("Error unlocking funds:", error);
  }
}

// async function listenForLockEvents() {
//     // Event listener for LockEvent
//     program.addEventListener('LockEvent', (event, slot) => {
//         console.log('LockEvent received:');
//         console.log('Transaction Signature:', event.txSignature);
//         console.log('Amount:', event.amount.toString());
//         console.log('Slot:', slot);
//     });

//     console.log('Listening for Lock events...');
// }

// Example usage
(async () => {
  try {
    // Step 1: Initialize PDA (only needs to be done once)
    // const { pda, bump } = await initializePDA();

    // Step 2: Listen for events
    // await listenForLockEvents();
    // const lockAmount = 100000000; // 0.1 SOL in lamports

    // 3. Unlock some SOL (0.05 SOL)
    const unlockAmount = 50000000;
    const txHash = await unlockSol(unlockAmount);
    console.log("sol unlock transaction", txHash);
    console.log(`Unlocked ${unlockAmount} lamports. Tx:`, txHash);
    // Check balances
    // const userBalance = await connection.getBalance(userWallet.publicKey);
    // const pdaBalance = await connection.getBalance(pda);
    // console.log(`User balance: ${userBalance} lamports`);
    // console.log(`PDA balance: ${pdaBalance} lamports`);
  } catch (error) {
    console.error("Error:", error);
  }
})();
