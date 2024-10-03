const express = require("express");
const { ethers, errors } = require("ethers");
const cors = require("cors");
require("dotenv").config();
const abi = require("../eip-712-frontend/src/app/contracts/abi.json");
const { Alchemy, Network, Wallet, Utils } = require("alchemy-sdk");
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(cors(corsOptions));

const contractAddress = "0xf80d2D0D9CEEe7263923EC629C372FC14bcA0d89";
const PORT = 8080;
const { RPC_URL, PRIVATE_KEY, WALLET_ADDRESS, API_KEY } = process.env;
const settings = {
  apiKey: API_KEY,
  network: Network.LINEA_SEPOLIA, // Replace with your network.
};
const alchemy = new Alchemy(settings);

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

async function relayGreeting(
  greetingText,
  greetingDeadline,
  greetingSender,
  v,
  r,
  s
) {
  try {
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const iface = contract.interface
        const sigHash = iface.getSighash("greet");
        console.log("Sig hash of greet is ",sigHash)
        const calldata = iface.encodeFunctionData("greet",[[greetingText,greetingDeadline],greetingSender,
        v,
        r,
        s
        ])

        console.log("Call data for greet is : \n", calldata)

        const decodeData = iface.decodeFunctionData("greet",calldata)
        console.log("Decode of greet",decodeData)
        const nonce1 =await alchemy.core.getTransactionCount(WALLET_ADDRESS)
        

    const transaction = {
      from: WALLET_ADDRESS,
      to: contractAddress,
      value: ethers.utils.hexlify(0),
      gasPrice: ethers.utils.hexlify(300000000),
      gasLimit : ethers.utils.hexlify(1000000),
      nonce: nonce1,
      data: calldata,
      chainId:59141,
    };
    
    console.log("tx data is " , transaction)
       const tx = await signer.signTransaction(transaction);
       console.log(tx)
      
      const tx2 = await alchemy.transact.sendTransaction(tx);
      tx2.wait(3)
      console.log("Tx Hash is : ",tx2)
  } catch(error) {
    console.log("Failed to fetch data from the contract");
    console.error(error)
  }
}

app.get("/relay", (req, res) => {
  var greetingText = req.query["greetingText"];
  var greetingDeadline = req.query["greetingDeadline"];
  var greetingSender = req.query["greetingSender"];
  var v = req.query["v"];
  var r = req.query["r"];
  var s = req.query["s"];
  var message = greetingSender + " sent a greet: " + " " + greetingText;

  console.log("greeting message", greetingText);
  console.log("greeting deadline", greetingDeadline);
  console.log("Sent by", greetingSender);
  console.log("v:", v);
  console.log("r ", r);
  console.log("s", s);
  relayGreeting(greetingText, greetingDeadline, greetingSender, v, r, s);
  res.setHeader("Content-Type", "application/json");
  res.send({
    message: message,
  });
});

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
