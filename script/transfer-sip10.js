//alex-slime, slime-alex swap
import {
  makeContractCall,
  broadcastTransaction,
  contractPrincipalCV,
  callReadOnlyFunction,
  Cl,
  principalCV,
  Pc,
  uintCV,
  someCV,
  PostConditionMode,
} from "@stacks/transactions";

const postCondition1 = Pc.principal("STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV")
  .willSendEq(100000000)
  .ft("STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV.stone-token", "stone-token");
const senderPrincipal = principalCV("STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV");
const recipientPrincipal = principalCV(
  "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV.bridge005"
);
async function sendTransaction() {
  const amount = Cl.uint(100000000);
  const txOptions = {
    contractAddress: "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
    contractName: "stone-token",
    functionName: "transfer",
    functionArgs: [
      amount,
      senderPrincipal, // `sender` as a Clarity principal
      recipientPrincipal, // `recipient` as a Clarity principal
      Cl.none(), // `memo` as a Clarity optional buffer
    ],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [postCondition1],
    senderKey: "private key",
    network: "testnet",
  };
  // console.log("txOptions :", txOptions);
  // Create and broadcast the transaction
  const transaction = await makeContractCall(txOptions);
  // console.log("Transaction:", transaction);
  const response = await broadcastTransaction(transaction, "testnet");
  console.log("Response:", response);
  // console.log("Function Args:", txOptions.functionArgs);
}
sendTransaction();
