"use client";
import { useEffect, useState } from "react";

import { useAccount } from "wagmi";
import { contractAbi, contractAddress } from "../../constants/index";

import { parseAbiItem } from "viem";

import { publicClient } from "@/utils/client";

import OneYmmo from "./OneYmmo";

const User = () => {
  const { address } = useAccount();
  const [listAddressContract, setListAddressContract] = useState([]);

  const getEvents = async () => {
    const proposalChangeLog = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem("event NewContractYmmoDeploy(address contractAddress)"),
      fromBlock: 6307000n,
      toBlock: "latest",
    });

    const array = proposalChangeLog.map((log) => log.args.contractAddress);
    setListAddressContract(array);
  };

  useEffect(() => {
    getEvents();
  }, [address]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <p className="text-xl font-semibold text-gray-800 mb-4">The list of contracts</p>
        {listAddressContract.map((contract, index) => (
          <OneYmmo key={index} addressContract={contract} IRLAddress="12 Rue de France" APY="7%" />
        ))}
      </div>
    </div>
  );
};

export default User;
