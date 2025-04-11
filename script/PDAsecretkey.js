import { Keypair } from "@solana/web3.js";

// Generate a new keypair
const bridgeVaultWallet = Keypair.generate();

console.log("Public Key:", bridgeVaultWallet.publicKey.toString());
console.log(
  "Private Key:",
  JSON.stringify(Array.from(bridgeVaultWallet.secretKey))
);

// Store this securely (NOT in frontend code!)
