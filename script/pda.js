import { PublicKey } from '@solana/web3.js';

const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from("bridge-vault")], // Must match Rust seeds!
  new PublicKey("BrqvbtST215rkLD1fyzj7p5j7tcVGoQPZ4T39GtkGttg")
);

console.log("Bridge Vault PDA:", pda.toString());
//8tb46dmk422pWHuY6HrpiYT7LigndUxhVnWdzUR7XxVi