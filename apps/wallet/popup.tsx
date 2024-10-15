import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import createMetaMaskProvider from 'metamask-extension-provider';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts, type TokenInfo } from '@lit-protocol/contracts-sdk';
import {
  LitNetwork,
  LIT_RPC,
  LIT_CHAINS,
  ProviderType,
  RELAYER_URL_BY_NETWORK,
} from '@lit-protocol/constants';
import { LitAuthClient, GoogleProvider } from '@lit-protocol/lit-auth-client';
import type { AuthMethod, IRelayPKP } from '@lit-protocol/types';
import {
  LitAbility,
  LitPKPResource,
  LitActionResource,
  createSiweMessage,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';

let litNodeClient: LitNodeClient;
let litContracts: LitContracts;
let litAuthClient: LitAuthClient;

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        padding: 16
      }}>
      <h2>
        Welcome to your{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
      </h2>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <a href="https://docs.plasmo.com" target="_blank">
        View Docs
      </a>
    </div>
  )
}

export default IndexPopup
