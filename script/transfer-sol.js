import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
// Connect to Solana RPC (Mainnet/Testnet/Devnet)
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const base58SecretKey = "secret key";

// Convert to Uint8Array
const secretKeyUint8 = bs58.decode(base58SecretKey);

// Load Keypair
const payer = Keypair.fromSecretKey(secretKeyUint8);
// Load Payer's Keypair (For testing, use a file or Phantom wallet)
//   const payer = Keypair.fromSecretKey(Uint8Array.from([
//      ""
//   ]));

// Define Program ID (Replace with your actual program ID)
const PROGRAM_ID = new PublicKey(
  "BrqvbtST215rkLD1fyzj7p5j7tcVGoQPZ4T39GtkGttg"
);

// Find PDA (Program Derived Address)
const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from("bridge-vault")], // PDA Seeds
  PROGRAM_ID
);
//   console.log("Bridge Vault PDA:", pda.toString());
console.log("PDA Address:", pda.toBase58());

// Create Transaction to Transfer SOL
const transferSolToPDA = async () => {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: pda,
        lamports: 2 * 1e9, // 0.1 SOL (in lamports)
      })
    );

    // Send transaction
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    );
    console.log("✅ SOL Transferred! Transaction Signature:", txSignature);
  } catch (error) {
    console.error("❌ Error sending SOL:", error);
  }
};

//   Execute the function
transferSolToPDA();
