"use client";

import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "../../constants/index";

import Owner from "./Owner";
import User from "./User";

const Ymmo = () => {
  const { address } = useAccount();

  const {
    data: ownerAddress,
    error: ownerError,
    isLoading: ownerLoading,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "owner",
  });

  if (ownerLoading) {
    return <div>Loading...</div>;
  }

  if (ownerError) {
    return <div>Error loading owner information.</div>;
  }

  return <div>{address === ownerAddress ? <Owner /> : <User />}</div>;
};

export default Ymmo;
