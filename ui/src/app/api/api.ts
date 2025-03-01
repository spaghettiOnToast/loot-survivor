import { useAccount } from "@starknet-react/core";

interface MintEthProps {
  address: string;
}

export const mintEth = async ({ address }: MintEthProps) => {
  try {
    const requestBody = {
      address: address,
      key2: "10000000000000000000",
      // Add other data you want to send in the request body
    };

    const response = await fetch("http://http://3.215.42.99:5050/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Check for a specific condition in the response to determine success
    if (response.ok && data.new_balance == "10000000000000000000") {
      return true;
    } else {
      console.error("Error in response:", data);
      return false;
    }
  } catch (error) {
    console.error("Error posting data:", error);
    return false;
  }
};
