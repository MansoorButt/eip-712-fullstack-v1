"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import getSigner from "@/app/signer";
import abi from "@/app/contracts/abi.json";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { TypedDataUtils } from "ethers-eip712";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Component() {
  const [greeting, setGreeting] = useState("Hello, World!");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [signer, setSigner] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [unixTimestamp, setUnixTimestamp] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const account: any = useAccount();
  let address1: any;

  const contractAddress = "0xf80d2D0D9CEEe7263923EC629C372FC14bcA0d89";
  let contract: ethers.Contract;
  let iface: ethers.utils.Interface;
  let ifrag : ethers.utils.FunctionFragment

  useEffect(() => {
    const fetchSigner = async () => {
      try {
        const provider = await getSigner();
        setAddress(contractAddress);
        console.log("Contract address is", contractAddress);
        contract = new ethers.Contract(contractAddress, abi, provider);
        iface = contract.interface
        const sigHash = iface.getSighash("verify");
        console.log("Sig hash of verify is ",sigHash)
        const calldata = iface.encodeFunctionData("greet",[["helloWorld",1727913600],"0x586414604Bbb0180759Fbd7F2A9088a2e778eE16",
        27,
        "0xaeb7e6e22c249db275f29e1dbcdb5953c015b543b2f8678a61cdd032e6836789",
        "0x2ed887df1e943b8421013a4ac7b0b8018895626aded44c0969bdbc4766be84d7"
        ])

        console.log("Call dat for greet is", calldata)

        const decodeData = iface.decodeFunctionData("greet",calldata)
        console.log("Decode of greet",decodeData)
        

        // iface = new ethers.utils.Interface(["function greetingText(string greetingText)"]);

        // ifrag = ethers.utils.FunctionFragment.from("function greet(Greeting memory greeting, address sender, uint8 v, bytes32 r, bytes32 s)")
        let x = await contract.greetingText();
        setMessage(x);
      } catch (error) {
        console.error("Error fetching signer:", error);
      }
    };

    fetchSigner();
  }, []);

  const handleSign = async () => {
    const provider = await getSigner();
    const { chainId } = await provider.getNetwork();
    const signedDataSigner = provider.getSigner();
    signedDataSigner.signTransaction;
    console.log("Bytes32 version is of greet",ethers.utils.formatBytes32String(greeting))

    const msgParams = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Greeting: [
          { name: "text", type: "string" },
          { name: "deadline", type: "uint" },
        ],
      },
      primaryType: "Greeting",
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: chainId,
        verifyingContract: contractAddress,
      },
      message: {
        text: greeting,
        deadline: unixTimestamp,
      },
    };
    console.log(msgParams);

    const digest = TypedDataUtils.encodeDigest(msgParams);
    const digestHex = ethers.utils.hexlify(digest);
    console.log("Chain Id is ", chainId)

    console.log("Your Digest is ", digest);
    console.log("Your digest hex is", digestHex);

    // console.log("Sender address",account.address)
    // // console.log("Your network is ", chainId)
    const signature = await signedDataSigner.provider.send(
      "eth_signTypedData_v4",
      [account.address, JSON.stringify(msgParams)]
    );
    //   console.log("Your signed has is",signedDataSigner)
    console.log("Your final signature is", signature);
    setSignature(signature);
  };

  const handleVerify = () => {
    setIsModalOpen(true);
  };

  async function relayGreeting(
    greetingText: string,
    greetingDeadline: number,
    greetingSender: string,
    signature: string
  ) {
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    const v = parseInt(signature.slice(130, 132), 16);
    console.log({ v, r, s });

    // let calldata = iface.encodeFunctionData(ifrag,[[greetingText,greetingDeadline],greetingSender,v,r,s])
    // console.log("Fragment is ",iface);

    

    var url = "http://localhost:8080/relay?";
    url += "greetingText=" + greetingText;
    url += "&greetingDeadline=" + greetingDeadline;
    url += "&greetingSender=" + greetingSender;
    url += "&v=" + v;
    url += "&r=" + r;
    url += "&s=" + s;

    const relayRequest = new Request(url, {
      method: "GET",
      headers: new Headers(),
      mode: "cors",
      cache: "default",
    });

    await fetch(relayRequest);

    alert("Message sent!");
    setIsModalOpen(false);
    console.log("Your URL is ", url);
  }

  const messaging = async () => {
    let defaultMessage = await contract.greetingText();
    console.log("message from contract is", defaultMessage);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    const timestamp = new Date(e.target.value).getTime() / 1000;
    setUnixTimestamp(timestamp);
  };

  return (
    <div>
      <Card className="w-full max-w-md mx-auto overflow-hidden bg-gradient-to-br from-slate-500 via-slate-700 to-slate-500">
        <div className="p-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <CardHeader className="bg-black p-6">
              <CardTitle className="text-2xl font-bold text-center text-white">
                {message}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <label
                  htmlFor="greeting-input"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set Message
                </label>
                <Input
                  id="greeting-input"
                  type="text"
                  placeholder="Enter greeting text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="date-input"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select Deadline
                </label>
                <Input
                  id="date-input"
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  className="w-full"
                />
              </div>
              {unixTimestamp && (
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Unix Timestamp: {unixTimestamp}
                  </p>
                </div>
              )}

              {signature && (
                <div
                  key="signature"
                  className="p-6 bg-gray-100 dark:bg-gray-700 rounded-md"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Signature: {signature}
                  </p>
                </div>
              )}
              <div key="connect-button" className="flex justify-center">
                <ConnectButton />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-6">
              {

               !signature ? <Button
                onClick={handleSign}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Sign Message
              </Button>:<Button
                onClick={()=> setSignature("")}
                className="bg-red-500 hover:bg-red-200 hover:text-red-600 text-white"
              >
                Reset Signature
              </Button> }
              {signature?<Button
                variant="outline"
                onClick={handleVerify}
                className="border-2 border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700"
              >
                Verify Signature
              </Button>:""}
            </CardFooter>
          </div>
        </div>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify and Relay Greeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="greeting" className="text-right font-medium">
                Greeting:
              </label>
              <Input
                id="greeting"
                value={greeting}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="deadline" className="text-right font-medium">
                Deadline:
              </label>
              <Input
                id="deadline"
                value={unixTimestamp || ""}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sender" className="text-right font-medium">
                Sender:
              </label>
              <Input
                id="sender"
                value={account.address}
                className="col-span-3"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="signature" className="text-right font-medium">
                Signature:
              </label>
              <Input
                id="signature"
                value={signature}
                className="col-span-3"
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                relayGreeting(
                  greeting,
                  unixTimestamp || 0,
                  account.address,
                  signature
                )
              }
            >
              Relay Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
