import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource
} from "@lit-protocol/auth-helpers"
import {
  LIT_CHAINS,
  LIT_RPC,
  LitNetwork,
  ProviderType,
  RELAYER_URL_BY_NETWORK
} from "@lit-protocol/constants"
import { LitContracts, type TokenInfo } from "@lit-protocol/contracts-sdk"
import { GoogleProvider, LitAuthClient } from "@lit-protocol/lit-auth-client"
import { LitNodeClient } from "@lit-protocol/lit-node-client"
import type { AuthMethod, IRelayPKP } from "@lit-protocol/types"
import { EnvelopeClosedIcon } from "@radix-ui/react-icons"
import { ethers } from "ethers"
import createMetaMaskProvider from "metamask-extension-provider"
import React, { useEffect, useState } from "react"
import "./styles/global.css"

import { Button } from "~/components/ui/button"

let litNodeClient: LitNodeClient
let litContracts: LitContracts
let litAuthClient: LitAuthClient


function IndexPopup() {
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState<boolean>(false);
  const pkpsPerPage = 10;

  useEffect(() => {
    if (isGoogleSignedIn) {
      fetchPkpDataGoogle();
    }
  }, [isGoogleSignedIn]);
  
  document.body.classList.add('dark');

  return (
    <div className="p-4 h-[600px] w-[360px] flex justify-center items-center">
      <Button>
        <EnvelopeClosedIcon className="mr-2 h-4 w-4" /> Login with Email
      </Button>
    </div>
  )
}

const fetchPkpDataGoogle = async () => {
    try {
      const result = await chrome.storage.local.get('authMethod');
      if (!result.authMethod) {
        throw new Error('No authMethod found in storage');
      }

      const authMethod: AuthMethod = {
        accessToken: result.authMethod.accessToken,
        authMethodType: result.authMethod.authMethodType,
      };
      const pkps = await googleProvider.fetchPKPsThroughRelayer(authMethod);
      setPkps(pkps);
      console.log('Pkps:', pkps);
      return pkps;
    } catch (error) {
      console.error('Error fetching PKPs:', error);
    }
  };

export default IndexPopup
