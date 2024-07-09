"use client";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

import { RocketIcon } from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ymmoFactoryContractAbi, ymmoFactoryContractAddress } from "@/constants/ymmoFactoryConstants";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { parseAbiItem } from "viem";

import { publicClient } from "@/utils/client";

const Owner = () => {
  const { address } = useAccount();
  const [currentValueYmmo, setCurrentValueYmmo] = useState("");

  const { data: hash, error, isPending, writeContract } = useWriteContract({});

  const {
    isLoading: isConfirming,
    isSuccess,
    error: errorConfirmation,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const createYmmo = async () => {
    writeContract({
      address: ymmoFactoryContractAddress,
      abi: ymmoFactoryContractAbi,
      functionName: "createYmmo",
      args: [BigInt(currentValueYmmo)],
    });
    setCurrentValueYmmo("");
  };

  return (
    <div>
      <div>
        <p>Create new Ymmo</p>
        <Input
          className="w-1/3 p-2 border border-gray-300 rounded"
          placeholder="The value of the Ymmo"
          onChange={(e) => {
            setCurrentValueYmmo(e.target.value);
          }}
        />
        <Button
          className="w-1/3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={createYmmo}
          disabled={isPending}
        >
          {isPending ? "Submitting..." : "Create Ymmo"}
        </Button>
        <div>
          {hash && (
            <Alert className="mb-4 bg-lime-200">
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>Transaction Hash: {hash}</AlertDescription>
            </Alert>
          )}
          {isConfirming && (
            <Alert className="mb-4 bg-amber-200">
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>Waiting for confirmation...</AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert className="mb-4 bg-lime-200">
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>Transaction confirmed.</AlertDescription>
            </Alert>
          )}
          {errorConfirmation && (
            <Alert className="mb-4 bg-red-400">
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorConfirmation.shortMessage || errorConfirmation.message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="mb-4 bg-red-400">
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error.shortMessage || error.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Owner;
