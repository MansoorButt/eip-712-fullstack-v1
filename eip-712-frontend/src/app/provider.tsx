"use client";

import { useState, useEffect } from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
  midnightTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { sepolia,lineaSepolia } from "wagmi/chains";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Connector, WagmiProvider, useAccount } from "wagmi";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "eip-712",
  projectId: "9db2098022f162c4f0e6cad18c5981c9",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [metaMaskWallet],
    },
  ],
  chains: [lineaSepolia,sepolia,(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia,lineaSepolia] : [])],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          coolMode
          theme={lightTheme({
            accentColor: "#7b3fe4",
            accentColorForeground: "black",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
