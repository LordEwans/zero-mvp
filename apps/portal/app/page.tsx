"use client";
import "@anima-protocol/personhood-sdk-react/style.css";
import { Personhood } from "@anima-protocol/personhood-sdk-react";
import { ethers } from "ethers";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get("address");

  const [sessionId, setSessionId] = useState("");

  const sign = async (message: string) => {
    const provider = new ethers.BrowserProvider(
      (window as unknown as any).ethereum
    );
    const signer = provider.getSigner();
    const signature = await (await signer).signMessage(message);
    return signature as string;
  };

  const onFinish = ({ info, state }: { info: any; state: any }) => {
    if (window.opener) {
      window.opener.postMessage({ info, state, type: "personhood" }, "*");
    }
  };

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          No Address Provided
        </h1>
        <p className="text-lg text-gray-600">
          Please provide a wallet address to continue.
        </p>
      </div>
    );
  }
  useEffect(() => {
    const requestOptions: RequestInit = {
      method: "GET",
    };

    fetch("https://session-phi.vercel/api/v1/init", requestOptions)
      .then((response) => response.text())
      .then((result) => setSessionId(result))
      .catch((error) => console.log(error));
  }, [walletAddress, router]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Personhood
        onFinish={onFinish}
        sessionId={sessionId}
        signCallback={async (payload: string | object) => {
          const message =
            typeof payload === "string" ? payload : JSON.stringify(payload);
          return sign(message);
        }}
        walletAddress={walletAddress as string}
      />
    </div>
  );
}
