"use client";

import NotConnected from "@/components/shared/NotConnected";
import Ymmo from "@/components/shared/Ymmo";

import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();

  return <>{isConnected ? <Ymmo /> : <NotConnected />}</>;
}
