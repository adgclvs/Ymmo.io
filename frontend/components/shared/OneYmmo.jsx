import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractAddress, tokenContractAbi, ymmoContractAbi } from "../../constants/index";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const OneYmmo = ({ addressContract, IRLAddress, APY }) => {
  const { address } = useAccount();
  const { toast } = useToast();

  const [valueOfYmmo, setValueOfYmmo] = useState(null);
  const [indexOfYmmo, setIndexOfYmmo] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [valueIncome, setValueIncome] = useState(null);
  const [amountToBuy, setAmountToBuy] = useState(null);

  const [addressToken, setAddressToken] = useState(null);
  const [balanceInEthContract, setBalanceInEthContract] = useState(null);
  const [balanceInYmmoContract, setBalanceInYmmoContract] = useState(null);
  const [balanceInYmmoUser, setBalanceInYmmoUser] = useState(null);

  const [valueWithdraw, setValueWithdraw] = useState(null);
  const [addressWithdraw, setAddressWithdraw] = useState(null);

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
    data: balanceData,
    error: balanceError,
    isLoading: balanceIsLoading,
  } = useBalance({
    address: addressContract,
  });

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
    data: owner,
    error: errorOwner,
    isLoading: isLoadingOwner,
  } = useReadContract({
    address: addressContract,
    abi: ymmoContractAbi,
    functionName: "owner",
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
    data: contractAdd,
    error: errorContractAdd,
    isLoading: isPendingContractAdd,
  } = useReadContract({
    address: addressContract,
    abi: ymmoContractAbi,
    functionName: "tokenContract",
  });

  const {
    data: contractBalance,
    error: errorContractBalance,
    isLoading: isPendingContractBalance,
  } = useReadContract({
    address: contractAdd,
    abi: tokenContractAbi,
    functionName: "balanceOf",
    args: [addressContract],
  });

  const {
    data: userBalance,
    error: errorUserBalance,
    isLoading: isPendingUserBalance,
  } = useReadContract({
    address: contractAdd,
    abi: tokenContractAbi,
    functionName: "balanceOf",
    args: [address],
  });

  //---------------------WRITE CONTRACT ----------------------------------

  const { data: hash, error, isPending, writeContract } = useWriteContract({});

  const sendIncome = async () => {
    let price;
    try {
      if (ethPriceInUSD) {
        price = valueIncome / ethPriceInUSD;
        price = parseEther(price.toString());
      }
      writeContract({
        address: addressContract,
        abi: ymmoContractAbi,
        functionName: "setValueIncome",
        args: [addressContract],
        value: price,
        account: address,
      });
    } catch (error) {
      toast({
        title: error.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: errorConfirmation,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (errorConfirmation) {
      toast({
        title: errorConfirmation.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
    if (error) {
      toast({
        title: error.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  }, [errorConfirmation, error]);

  //-------------------------------------------------------------------

  const {
    data: buyHash,
    error: buyError,
    isPending: buyIsPending,
    writeContract: buyWriteContract,
  } = useWriteContract({});

  const buyToken = async () => {
    let price;
    try {
      if (ethPriceInUSD) {
        price = amountToBuy / ethPriceInUSD;
        price = parseEther(price.toString());
      }
      buyWriteContract({
        address: addressContract,
        abi: ymmoContractAbi,
        functionName: "buyTokens",
        args: [addressContract],
        value: price,
        account: address,
      });
    } catch (error) {
      toast({
        title: error.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  };

  const {
    isLoading: buyIsConfirming,
    isSuccess: buyIsSuccess,
    error: buyErrorConfirmation,
  } = useWaitForTransactionReceipt({
    buyHash,
  });

  useEffect(() => {
    if (buyErrorConfirmation) {
      toast({
        title: buyErrorConfirmation.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
    if (buyError) {
      toast({
        title: buyError.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  }, [buyErrorConfirmation, buyError]);

  //------------------------------------------------------------------

  const {
    data: getIncomeHash,
    error: getIncomeError,
    isPending: getIncomeIsPending,
    writeContract: getIncomeWriteContract,
  } = useWriteContract({});

  const getIncome = async () => {
    try {
      getIncomeWriteContract({
        address: addressContract,
        abi: ymmoContractAbi,
        functionName: "getIncome",
        account: address,
      });
    } catch (error) {
      toast({
        title: error.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  };

  const {
    isLoading: getIncomeIsConfirming,
    isSuccess: getIncomeIsSuccess,
    error: getIncomeErrorConfirmation,
  } = useWaitForTransactionReceipt({
    getIncomeHash,
  });

  useEffect(() => {
    if (getIncomeErrorConfirmation) {
      toast({
        title: getIncomeErrorConfirmation.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
    if (getIncomeError) {
      toast({
        title: getIncomeError.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  }, [getIncomeErrorConfirmation, getIncomeError]);

  //------------------------------------------------------------------

  const {
    data: changeIncomeHash,
    error: changeIncomeError,
    isPending: changeIncomeIsPending,
    writeContract: changeIncomeWriteContract,
  } = useWriteContract({});

  const changeIncome = async () => {
    try {
      changeIncomeWriteContract({
        address: addressContract,
        abi: ymmoContractAbi,
        functionName: "changeAvailableIncome",
        account: address,
      });
    } catch (error) {
      toast({
        title: error.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  };

  const {
    isLoading: changeIncomeIsConfirming,
    isSuccess: changeIncomeIsSuccess,
    error: changeIncomeErrorConfirmation,
  } = useWaitForTransactionReceipt({
    changeIncomeHash,
  });

  useEffect(() => {
    if (changeIncomeErrorConfirmation) {
      toast({
        title: changeIncomeErrorConfirmation.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
    if (changeIncomeError) {
      toast({
        title: changeIncomeError.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  }, [changeIncomeErrorConfirmation, changeIncomeError]);

  //------------------------------------------------------------------

  const {
    data: resetRetrieveHash,
    error: resetRetrieveError,
    isPending: resetRetrieveIsPending,
    writeContract: resetRetrieveWriteContract,
  } = useWriteContract({});

  const resetRetrieveState = async () => {
    try {
      resetRetrieveWriteContract({
        address: addressContract,
        abi: ymmoContractAbi,
        functionName: "resetRetrieveState",
      });
    } catch (error) {
      toast({
        title: error.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  };

  const {
    isLoading: resetRetrieveIsConfirming,
    isSuccess: resetRetrieveIsSuccess,
    error: resetRetrieveErrorConfirmation,
  } = useWaitForTransactionReceipt({
    resetRetrieveHash,
  });

  useEffect(() => {
    if (resetRetrieveErrorConfirmation) {
      toast({
        title: resetRetrieveErrorConfirmation.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
    if (resetRetrieveError) {
      toast({
        title: resetRetrieveError.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  }, [resetRetrieveErrorConfirmation, resetRetrieveError]);

  //------------------------------------------------------------------

  const {
    data: withdrawHash,
    error: withdrawError,
    isPending: withdrawIsPending,
    writeContract: withdrawWriteContract,
  } = useWriteContract({});

  const withdraw = async () => {
    let price;
    try {
      if (ethPriceInUSD) {
        price = valueWithdraw / ethPriceInUSD;
        price = parseEther(price.toString());
      }
      withdrawWriteContract({
        address: addressContract,
        abi: ymmoContractAbi,
        functionName: "withdrawETH",
        args: [addressWithdraw, price],
      });
    } catch (error) {
      toast({
        title: error.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  };

  const {
    isLoading: withdrawIsConfirming,
    isSuccess: withdrawIsSuccess,
    error: withdrawErrorConfirmation,
  } = useWaitForTransactionReceipt({
    changeIncomeHash,
  });

  useEffect(() => {
    if (withdrawErrorConfirmation) {
      toast({
        title: withdrawErrorConfirmation.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
    if (withdrawError) {
      toast({
        title: withdrawError.message,
        duration: 3000,
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }
  }, [withdrawErrorConfirmation, withdrawError]);

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
      setBalanceInEthContract(balanceData.formatted.toString());
    }
  }, [balanceData]);

  useEffect(() => {
    if (contractAdd) {
      setAddressToken(contractAdd.toString());
    }
  }, [contractAdd]);

  useEffect(() => {
    if (contractBalance) {
      setBalanceInYmmoContract(contractBalance.toString());
    }
  }, [contractBalance]);

  useEffect(() => {
    if (userBalance) {
      setBalanceInYmmoUser(userBalance.toString());
    }
  }, [userBalance]);

  if (valueIsLoading || indexIsLoading || balanceIsLoading || isLoadingOwner || isConfirming)
    return <div>Loading...</div>;
  if (valueError) return <div>Error: {valueError.message}</div>;
  if (indexError) return <div>Error: {indexError.message}</div>;
  if (balanceError) return <div>Error: {balanceError.message}</div>;
  if (errorOwner) return <div>Error: {errorOwner.message}</div>;
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
            <span className="font-medium">{balanceInEthContract ? balanceInEthContract : "Loading..."} ETH</span>
          </p>
          <p className="text-gray-600">
            Balance of token:{" "}
            <span className="font-medium">
              {balanceInYmmoContract ? balanceInYmmoContract / 10 ** 18 : "Loading..."} YMMO
            </span>
          </p>
          <p className="text-gray-600">
            Your balance on this YMMO:{" "}
            <span className="font-medium">{balanceInYmmoUser ? balanceInYmmoUser / 10 ** 18 : "0"} YMMO</span>
          </p>
        </div>
      </div>
      {isClicked &&
        (address === owner ? (
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
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              onClick={changeIncome}
              disabled={changeIncomeIsPending}
            >
              {changeIncomeIsPending ? "Submitting..." : "Change available status"}
            </Button>
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              onClick={resetRetrieveState}
              disabled={resetRetrieveIsPending}
            >
              {resetRetrieveIsPending ? "Submitting..." : "Authorize retreive"}
            </Button>
            <Input
              className="w-full p-2 border border-gray-300 rounded mt-2"
              placeholder="Withdraw (€)"
              onChange={(e) => setValueWithdraw(e.target.value)}
            />
            <Input
              className="w-full p-2 border border-gray-300 rounded mt-2"
              placeholder="Address"
              onChange={(e) => setAddressWithdraw(e.target.value.toString())}
            />
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              onClick={withdraw}
              disabled={withdrawIsPending}
            >
              {withdrawIsPending ? "withdraw..." : "Withdraw"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 p-2 bg-gray-100 rounded-lg">
            <Input
              className="w-full p-2 border border-gray-300 rounded mt-2"
              placeholder="Amount To Buy"
              onChange={(e) => setAmountToBuy(e.target.value)}
            />
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              onClick={buyToken}
              disabled={buyIsPending}
            >
              {isPending ? "Buying..." : "Buy"}
            </Button>
            <Button
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
              onClick={getIncome}
              disabled={getIncomeIsPending}
            >
              {isPending ? "Sending..." : "Retrieve your income !"}
            </Button>
          </div>
        ))}
    </div>
  );
};

export default OneYmmo;
