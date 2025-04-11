import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet, web3 } from '@project-serum/anchor';
import bs58 from 'bs58';
import anchor from '@project-serum/anchor';
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// 👇 This replicates __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idlPath = path.join(__dirname, "../script/id1.json");

const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
// === CONFIGURATION ===
const CLUSTER_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('BrqvbtST215rkLD1fyzj7p5j7tcVGoQPZ4T39GtkGttg');

// Your user keypair (who is calling unlock)
const base58SecretKey = '3M7dw9Rzug9SyRaon3GGZCWvLmGYdKy1ag9KG7NVcCd8JVV6YE25NuV35cz6zZ3Gw7B7nZoVEkHQXse9BarSnaxQ';
const userKeypair = Keypair.fromSecretKey(bs58.decode(base58SecretKey));

const wallet = new Wallet(userKeypair);
// Recipient of the SOL
const recipientPubkey = new PublicKey('GoE3DAzPgseGUFAn9ufQjgKdQ1jAoL6LUtgMEzmN9EZ7');
// Amount to unlock (in lamports)
const unlockAmount = 0.05 * web3.LAMPORTS_PER_SOL; // 0.05 SOL
// === SETUP CONNECTION AND PROGRAM ===
const connection = new Connection(CLUSTER_URL, 'confirmed');
const provider = new AnchorProvider(connection, wallet, {});

const program = new Program(idl, PROGRAM_ID, provider);

async function unlockSol() {
  try {
    // Derive PDA with same seed and program ID
    const [pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from('bridge-vault')],
      PROGRAM_ID
    );

    console.log('PDA Address:', pda.toBase58());

    // Call unlock function from program
    const tx = await program.methods
      .unlock(new anchor.BN(unlockAmount))
      .accounts({
        pda,
        recipient: recipientPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('✅ Unlock transaction sent!');
    console.log('Tx Signature:', tx);

    // Optional: Confirm balances
    const recipientBalance = await connection.getBalance(recipientPubkey);
    console.log('Recipient Balance:', recipientBalance / web3.LAMPORTS_PER_SOL, 'SOL');

  } catch (err) {
    console.error('❌ Error running unlock:', err);
  }
}

unlockSol();
