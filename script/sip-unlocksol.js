import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, web3 } from "@project-serum/anchor";
import anchor from "@project-serum/anchor";
import bs58 from "bs58";
import {
  Cl,
  makeContractCall,
  broadcastTransaction,
  PostConditionMode,
  principalCV,
  contractPrincipalCV,
  cvToValue,
  cvToJSON,
} from "@stacks/transactions";

import { STACKS_TESTNET } from "@stacks/network";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { getConvertedAmount } from "./stone-sol.js";
import { lookUPEvent, waitForTxConfirmation } from "./read-map.js";
const networkUrl = "https://api.testnet.hiro.so"; // or mainnet
const network = STACKS_TESTNET;
const apiUrl = network.coreApiUrl;
// 👇 This replicates __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idlPath = path.join(__dirname, "../script/id1.json");

const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
// === CONFIGURATION ===
const CLUSTER_URL = "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey(
  "BrqvbtST215rkLD1fyzj7p5j7tcVGoQPZ4T39GtkGttg"
);

// Your user keypair (who is calling unlock)
const base58SecretKey = "secret key";
const userKeypair = Keypair.fromSecretKey(bs58.decode(base58SecretKey));

const wallet = new Wallet(userKeypair);
const recipientPubkey = new PublicKey(
  "GoE3DAzPgseGUFAn9ufQjgKdQ1jAoL6LUtgMEzmN9EZ7"
);
const unlockAmount = 0.05 * web3.LAMPORTS_PER_SOL; // 0.05 SOL
// === SETUP CONNECTION AND PROGRAM ===
const connection = new Connection(CLUSTER_URL, "confirmed");
const provider = new AnchorProvider(connection, wallet, {});

const program = new Program(idl, PROGRAM_ID, provider);
async function unlockSol(unlockAmount) {
  try {
    // Derive PDA with same seed and program ID
    const [pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("bridge-vault")],
      PROGRAM_ID
    );

    console.log("PDA Address:", pda.toBase58());

    // Call unlock function from program
    const tx = await program.methods
      .unlock(new anchor.BN(unlockAmount))
      .accounts({
        pda,
        recipient: recipientPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Unlock transaction sent!");
    console.log("Tx Signature:", tx);

    // Optional: Confirm balances
    const recipientBalance = await connection.getBalance(recipientPubkey);
    console.log(
      "Recipient Balance:",
      recipientBalance / web3.LAMPORTS_PER_SOL,
      "SOL"
    );
  } catch (err) {
    console.error("❌ Error running unlock:", err);
  }
}

//    unlockSol(unlockAmount);
/////////////////////////////
//lock Sip10
const STACKS_BRIDGE_ADDRESS = "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV";
const STACKS_BRIDGE_NAME = "bridge005";
const sip10Decimals = 1000000;
async function lockSip10(sip10Amount) {
  // Part 1: Lock SIP-10 tokens on Stacks
  const stacksNetwork = "testnet";
  const tokenTrait = contractPrincipalCV(
    "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
    "stone-token"
  );

  const lockOptions = {
    contractAddress: STACKS_BRIDGE_ADDRESS,
    contractName: STACKS_BRIDGE_NAME,
    functionName: "lock",
    functionArgs: [Cl.uint(sip10Amount), tokenTrait],
    senderKey: "private key",
    validateWithAbi: true,
    network: stacksNetwork,
    postConditionMode: PostConditionMode.Allow,
    fee: 2000n,
  };

  const lockTx = await makeContractCall(lockOptions);
  const result = await broadcastTransaction(lockTx, stacksNetwork);

  // console.log("SIP-10 tokens locked successfully. Tx hash:",result);
  if ("txid" in result) {
    const txid = result.txid;
    console.log("STONE TxID:", txid);

    await waitForTxConfirmation(txid, networkUrl);
  }
  // const solAmountToUnlock =await getConvertedAmount(txDetails.sip10Amount / sip10Decimals)

  return {
    result,
    sip10Amount,
  };
}
// lockSip10(2000000)

async function executeBridge() {
  try {
    console.log("🌉 Starting Bridge Process...");

    const txDetails = await lockSip10(10 * sip10Decimals);
    console.log("\n⏳ Triggering SIP10 lock ...");

    // const event = await lookUPEvent(32);
    // if (!event) {
    //   throw new Error("Lock event not found - transaction may have failed");
    // }
    // console.log("event", event.amount)

    const solAmountToUnlock = await getConvertedAmount(
      txDetails.sip10Amount / sip10Decimals
    );
    await unlockSol(solAmountToUnlock);
    console.log("\n⏳ Triggering SOL unlock based on SIP10...");

    console.log("\n🎉 Bridge Process Completed Successfully!");
    console.log(`🔒 SIP10 Locked: ${txDetails.sip10Amount / sip10Decimals}`);
    console.log(`🔓 SOL Unlocked: ${solAmountToUnlock}`);
  } catch (error) {
    console.error("\n🔴 Bridge Process Failed:", error.message || error);
    process.exit(1);
  }
}

// Run the bridge
executeBridge();
