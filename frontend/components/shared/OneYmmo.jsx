import axios from "axios";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractAddress, ymmoContractAbi } from "../../constants/index";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const OneYmmo = ({ addressContract, IRLAddress, APY }) => {
  const [valueOfYmmo, setValueOfYmmo] = useState(null);
  const [indexOfYmmo, setIndexOfYmmo] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [valueIncome, setValueIncome] = useState(null);
  const [ethValueIncome, setEthValueIncome] = useState(null); // Store the ETH value

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

  const { data: hash, error, isPending, writeContract } = useWriteContract({});

  const {
    isLoading: isConfirming,
    isSuccess,
    error: errorConfirmation,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur");
      return response.data.ethereum.eur;
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
      return null;
    }
  };

  const sendIncome = async () => {
    const conversionRate = await fetchConversionRate();
    if (conversionRate) {
      const ethValue = valueIncome / conversionRate;
      console.log(ethValue);
      setEthValueIncome(ethValue);
      writeContract({
        address: contractAddress,
        abi: ymmoContractAbi,
        functionName: "setValueIncome",
        overrides: {
          value: parseEther(ethValue.toString()), // Convertit la valeur en wei
        },
      });
      setValueIncome(null);
    } else {
      console.error("Failed to convert valueIncome to ETH.");
    }
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

  if (valueIsLoading || indexIsLoading || isConfirming) return <div>Loading...</div>;
  if (valueError) return <div>Error: {valueError.message}</div>;
  if (indexError) return <div>Error: {indexError.message}</div>;
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
