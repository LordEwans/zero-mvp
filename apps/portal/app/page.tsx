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

  useEffect(() => {
    if (!walletAddress) {
      router.push("/null");
      return;
    }

    const requestOptions: RequestInit = {
      method: "GET",
    };

    fetch("https://session-phi.vercel.app/api/v1/init", requestOptions)
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
