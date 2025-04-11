import { Connection, PublicKey } from "@solana/web3.js";

// 1. Connect to Solana (Devnet/Mainnet)
const connection = new Connection("https://api.devnet.solana.com"); // or "https://api.mainnet-beta.solana.com"

// 2. Define the PDA address (replace with your PDA)
const PDA = new PublicKey("APqctvRGYBXxgasti2vu6umGGpFqZN2bZnQSxeXG7GPS");

// 3. Fetch balance (in lamports)
async function checkPDABalance() {
  try {
    const balanceInLamports = await connection.getBalance(PDA);
    const balanceInSOL = balanceInLamports / 1_000_000_000; // Convert lamports → SOL
    console.log(`PDA Balance: ${balanceInSOL} SOL`);
    return balanceInSOL;
  } catch (err) {
    console.error("Error fetching balance:", err);
    return 0;
  }
}

// Run
checkPDABalance();