import {
      Cl,
      listCV,
      trueCV,
      falseCV,
      principalToString,
      Pc,
      cvToJSON,
      boolCV,
      tupleCV,
      cvToValue,
      principalCV,
      uintCV,
      callReadOnlyFunction,
      
} from "@stacks/transactions";
import fetch from 'node-fetch'; // or global fetch in browser
// const id = 
export async function lookUPEvent(id) {
      const tx = {
            contractAddress: "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
            contractName: "bridge005",
            functionName: "get-lock-event",
            functionArgs: [Cl.uint(id)],
    network: "testnet",
    senderAddress: "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
  };
  
  try {
        const result = await callReadOnlyFunction(tx);
        //     console.log("event map",result)
        const parsedResult = cvToJSON(result);
        //     console.log("parsed result", parsedResult)
        //     Check if the optional contains a value
        if (parsedResult.value === null) {
              console.log(`No lock event found for ID ${id}`);
              return;
            }

            // Extract the nested tuple values
            const eventData = parsedResult.value.value;
            
            // Format and log each piece of data
            console.log('Lock Event Details:');
            console.log('-------------------');
            console.log('Amount:', eventData.amount.value);
            console.log('Sender:', eventData.sender.value);
            console.log('Token:', eventData.token.value);
            console.log('-------------------');
            
            // Return formatted data for further use
            return {
                  amount: Number(eventData.amount.value),
                  sender: eventData.sender.value,
                  token: eventData.token.value
            };

      } catch (error) {
            console.error("Error fetching balances:", error);
      }
}
// lookUPEvent(0);
// /////////////////////////////////////


export async function waitForTxConfirmation(txid, networkUrl) {
      const url = `${networkUrl}/extended/v1/tx/${txid}`;
      
      while (true) {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.tx_status === 'success') {
          console.log("✅ Transaction confirmed!");
      break;
    } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition' || data.tx_status === 'rejected') {
      console.error("❌ Transaction failed:", data.tx_status, data);
      break;
    } else {
      console.log("⏳ Still pending... waiting...");
      await new Promise(resolve => setTimeout(resolve, 10000)); // wait 10 seconds
    }
  }
}




