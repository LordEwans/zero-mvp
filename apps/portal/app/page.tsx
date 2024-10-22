"use client"
import "@anima-protocol/personhood-sdk-react/style.css";
import { Personhood } from "@anima-protocol/personhood-sdk-react";
import { ethers } from 'ethers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get('address');

  const sign = async (message: string) => {
    const provider = new ethers.BrowserProvider((window as unknown as any).ethereum);
    const signer = provider.getSigner();
    const signature = await (await signer).signMessage(message);
    return signature as string;
  };

  const onFinish = ({ info, state }: { info: any; state: any }) => {
    if (window.opener) {
      window.opener.postMessage({ info, state, type: 'personhood' }, '*');
    }
  };

  useEffect(() => {
    if (!walletAddress) {
      router.push('/null');
    }
  }, [walletAddress, router]);

  if (!walletAddress) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Personhood
        onFinish={onFinish}
        sessionId=""
        signCallback={async (payload: string | object) => {
          const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
          return sign(message);
        }}
        walletAddress={walletAddress} 
      />
    </div>
  );
}

