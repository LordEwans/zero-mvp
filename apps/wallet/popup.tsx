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
import { EnvelopeClosedIcon, ActivityLogIcon } from "@radix-ui/react-icons"
import * as Comlink from "comlink"
import { ethers } from "ethers"
import createMetaMaskProvider from "metamask-extension-provider"
import React, { useEffect, useState } from "react"

import "./styles/global.css"

import { NotaryServer, type Commit } from "tlsn-js"

import { Button } from "~/components/ui/button"

let litNodeClient: LitNodeClient
let litContracts: LitContracts
let litAuthClient: LitAuthClient

export default function IndexPopup() {
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState<boolean>(false)
  const pkpsPerPage = 10

  useEffect(() => {
    if (isGoogleSignedIn) {
      fetchPkpDataGoogle()
    }
  }, [isGoogleSignedIn])

  document.body.classList.add("dark")

  return (
    <div className="p-4 h-[600px] w-[360px] flex justify-center items-center space-x-2 space-y-2">
      <a href="/options.html" target="_blank" className="href">
        <Button>
          <EnvelopeClosedIcon className="mr-2 h-4 w-4" /> Sign In with Email
        </Button>
      </a>
      <Button onClick={notarise}>
          <ActivityLogIcon className="mr-2 h-4 w-4" /> Notarise
        </Button>
    </div>
  )
}

const fetchPkpDataGoogle = async () => {
  try {
    const result = await chrome.storage.local.get("authMethod")
    if (!result.authMethod) {
      throw new Error("No authMethod found in storage")
    }

    const authMethod: AuthMethod = {
      accessToken: result.authMethod.accessToken,
      authMethodType: result.authMethod.authMethodType
    }
    const pkps = await googleProvider.fetchPKPsThroughRelayer(authMethod)
    setPkps(pkps)
    console.log("Pkps:", pkps)
    return pkps
  } catch (error) {
    console.error("Error fetching PKPs:", error)
  }
}

const notarise = async () => {
  console.log("notarise")
  let step = 0;
  const { init, Prover, NotarizedSession, TlsProof }: any = Comlink.wrap(
    new Worker(new URL("./background/index", import.meta.url), { type: 'module' })
  )
  console.log(`Step ${step++}: Worker created`)

  // To create a proof
  await init({ loggingLevel: "Debug " })
  console.log(`Step ${step++}: init completed`)
  const notary = NotaryServer.from(`https://tlsn.0xzero.org/`)
  const prover = await new Prover({ serverDns: "swapi.dev" })
  console.log(`Step ${step++}: Prover created`)

  // Connect to verifier
  await prover.setup(await notary.sessionUrl())
  console.log(`Step ${step++}: Prover setup completed`)

  // Submit request
  await prover.sendRequest("ws://localhost:55688", {
    url: "https://swapi.dev/api/people/1",
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      hello: "world",
      one: 1
    }
  })
  console.log(`Step ${step++}: Request sent`)

  // Get transcript and precalculated ranges
  const transcript = await prover.transcript()
  console.log(`Step ${step++}: Transcript received`)

  // Select ranges to commit
  const commit: Commit = {
    sent: [
      transcript.ranges.sent.info!,
      transcript.ranges.sent.headers!["content-type"],
      transcript.ranges.sent.headers!["host"],
      ...transcript.ranges.sent.lineBreaks
    ],
    recv: [
      transcript.ranges.recv.info!,
      transcript.ranges.recv.headers!["server"],
      transcript.ranges.recv.headers!["date"],
      transcript.ranges.recv.json!["name"],
      transcript.ranges.recv.json!["gender"],
      ...transcript.ranges.recv.lineBreaks
    ]
  }

  // Notarize selected ranges
  const serializedSession = await prover.notarize(commit)
  console.log(`Step ${step++}: Session notarized`)

  // Instantiate NotarizedSession
  // note: this is necessary because workers can only post messages in serializable values
  const notarizedSession = await new NotarizedSession(serializedSession)
  console.log(`Step ${step++}: NotarizedSession created`)

  // Create proof for commited ranges
  // note: this will reveal the selected ranges
  const serializedProof = await notarizedSession.proof(commit)
  console.log(`Step ${step++}: Proof created`)

  // Instantiate Proof
  // note: necessary due to limitation with workers
  const proof = await new TlsProof(serializedProof)
  console.log(`Step ${step++}: Proof instantiated`)

  // Verify a proof
  const proofData = await proof.verify({
    typ: "P256",
    key: await notary.publicKey()
  })
  console.log(`Step ${step++}: Proof verified`)
  console.log(proofData)
}
