import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { ymmoContractAbi } from "../../constants/index";

const OneYmmo = ({ addressContract, IRLAddress, APY }) => {
  const [valueOfYmmo, setValueOfYmmo] = useState(null);
  const [indexOfYmmo, setIndexOfYmmo] = useState(null);

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

  if (valueIsLoading || indexIsLoading) return <div>Loading...</div>;
  if (valueError) return <div>Error: {valueError.message}</div>;
  if (indexError) return <div>Error: {indexError.message}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <img src="https://via.placeholder.com/150" alt="Property" className="w-full h-32 object-cover rounded-t-lg" />
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
  );
};

export default OneYmmo;
