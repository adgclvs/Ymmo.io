import axios from "axios";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractAddress, ymmoContractAbi } from "../../constants/index";
import { Button } from "../ui/button";

import { Input } from "../ui/input";

const OneYmmo = ({ addressContract, IRLAddress, APY }) => {
  const { address } = useAccount();

  const [valueOfYmmo, setValueOfYmmo] = useState(null);
  const [indexOfYmmo, setIndexOfYmmo] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [valueIncome, setValueIncome] = useState(null);

  const [addressToken, setAddressToken] = useState(null);

  const [ethPriceInUSD, setEthPriceInUSD] = useState(null);

  //------------CHAINLINK----------------------------------

  const { data: ethPrice } = useReadContract({
    address: addressContract,
    abi: ymmoContractAbi,
    functionName: "getChainlinkDataFeedLatestAnswer",
  });

  useEffect(() => {
    if (ethPrice) {
      const ethPriceInUSD = Number(ethPrice) / 10 ** 8;
      setEthPriceInUSD(ethPriceInUSD); // Price of 1 ETHER in USD
    }
  }, [ethPrice]);

  //-------------------DATA---------------------------

  const {
    data: valueData,
    error: valueError,
    isLoading: valueIsLoading,
  } = useReadContract({
    address: addressContract,
    abi: ymmoContractAbi,
    functionName: "valueOfYmmo",
  });

  const {
    data: indexData,
    error: indexError,
    isLoading: indexIsLoading,
  } = useReadContract({
    address: addressContract,
    abi: ymmoContractAbi,
    functionName: "indexOfYmmo",
  });

  const {
    data: balanceData,
    error: balanceError,
    isLoading: balanceIsLoading,
  } = useBalance({
    address: addressContract,
  });

  const {
    data: contractAdd,
    error: errorContractAdd,
    isLoading: isPendingContractAdd,
  } = useReadContract({
    address: addressContract,
    abi: ymmoContractAbi,
    functionName: "tokenContract",
  });

  //---------------------WRITE CONTRACT ----------------------------------

  const { data: hash, error, isPending, writeContract } = useWriteContract({});

  const sendIncome = async () => {
    let price;
    try {
      if (ethPriceInUSD) {
        price = (valueIncome + 0.01 * valueIncome) / ethPriceInUSD;
        price = parseEther(price.toString());
      }
      let test = "0.01";
      writeContract({
        address: addressContract,
        abi: ymmoContractAbi,
        functionName: "setValueIncome",
        args: [addressContract],
        value: parseEther(test.toString()),
        account: address,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: errorConfirmation,
  } = useWaitForTransactionReceipt({
    hash,
  });

  //-------------------------------------------------------------------

  const {
    data: buyHash,
    error: buyError,
    isPending: buyIsPending,
    writeContract: buyWriteContract,
  } = useWriteContract({});

  const buyToken = async () => {
    buyWriteContract({
      address: addressContract,
      abi: ymmoContractAbi,
      functionName: "setValueIncome",
      args: [addressContract],
      value: parseEther(indexOfYmmo.toString()),
    });
  };

  const getDataTokenContract = async () => {};

  //------------------------------------------------------------------

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  useEffect(() => {
    if (valueData) {
      setValueOfYmmo(valueData.toString());
    }
  }, [valueData]);

  useEffect(() => {
    if (indexData) {
      setIndexOfYmmo(indexData.toString());
    }
  }, [indexData]);

  useEffect(() => {
    if (balanceData) {
      setIndexOfYmmo(balanceData.toString());
    }
  }, [balanceData]);

  useEffect(() => {
    if (contractAdd) {
      setIndexOfYmmo(contractAdd.toString());
    }
  }, [contractAdd]);

  console.log(contractAdd);

  if (valueIsLoading || indexIsLoading || balanceIsLoading || isConfirming) return <div>Loading...</div>;
  if (valueError) return <div>Error: {valueError.message}</div>;
  if (indexError) return <div>Error: {indexError.message}</div>;
  if (balanceError) return <div>Error: {balanceError.message}</div>;
  if (errorConfirmation) return <div>Error: {errorConfirmation.message}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105">
      <div onClick={handleClick}>
        <img src="/img/house.jpg" alt="Property" className="w-full h-32 object-cover rounded-t-lg" />
        <div className="mt-2">
          <p className="text-gray-600">
            Value of Ymmo: <span className="font-medium">{valueOfYmmo} € </span>
          </p>
          <p className="text-gray-600">
            Index of Ymmo: <span className="font-medium">{indexOfYmmo}</span>
          </p>
          <p className="text-gray-600">
            IRL Address: <span className="font-medium">{IRLAddress}</span>
          </p>
          <p className="text-gray-600">
            APY: <span className="font-medium">{APY}</span>
          </p>
          <p className="text-gray-600">
            Contract Balance:{" "}
            <span className="font-medium">{balanceData ? balanceData.formatted : "Loading..."} ETH</span>
          </p>
        </div>
      </div>
      {isClicked && (
        <div className="mt-4 p-2 bg-gray-100 rounded-lg">
          <Input
            className="w-full p-2 border border-gray-300 rounded mt-2"
            placeholder="Value Income (€)"
            onChange={(e) => setValueIncome(e.target.value)}
          />
          <Button
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
            onClick={sendIncome}
            disabled={isPending}
          >
            {isPending ? "Submitting..." : "Set Income"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OneYmmo;
