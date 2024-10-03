
import Component from "@/components/gradient-greeting-card";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useAccount } from "wagmi";


export default function Home() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl ml-8 text-center rounded-xl font-bold text-white bg-gradient-to-r from-blue-700 to-blue-800 p-6"> EIP-712 Implementation</h1>
        <Component />
      </main>
      
    </div>
  );
}
