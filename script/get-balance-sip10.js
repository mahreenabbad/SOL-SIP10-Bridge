import {
      callReadOnlyFunction,
      cvToValue,
      principalCV
      
    } from "@stacks/transactions";

const principal = principalCV(
        "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV.bridge004"
      );
      const options = {
        contractAddress: "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
        contractName: "stone-token",
        functionName: "get-balance",
        functionArgs: [principal],
        network: "testnet",
        senderAddress: "STXWGJQ101N1C1FYHK64TGTHN4793CHVKRW3ZGVV",
      };
      async function callgetBalance() {
        try {
          const response = await callReadOnlyFunction(options);
          const balance = cvToValue(response);
          console.log("Token Balance :", balance);
          //   const data = response.value.data;
          //   console.log("Total supply of xtoken:", data.fee.value);
        } catch (error) {
          console.log("transaction error: ", error);
        }
      }
      callgetBalance();