import { ActivityLogIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons"
import React, { useEffect, useState } from "react"

import "./styles/global.css"
import { Button } from "~/components/ui/button"

export default function IndexPopup() {
  document.body.classList.add("dark")

  return (
    <div className="p-4 h-[600px] w-[360px] flex justify-center items-center space-x-2 space-y-2">
      <a href="/options.html" target="_blank" className="href">
        <Button>
          <EnvelopeClosedIcon className="mr-2 h-4 w-4" /> Sign In with Email
        </Button>
      </a>
      <Button onClick={runNotarization}>
        <ActivityLogIcon className="mr-2 h-4 w-4" /> Notarise
      </Button>
    </div>
  )
}

import * as Comlink from 'comlink';
import type { PresentationJSON } from 'tlsn-js/build/types';
import { type Commit } from "tlsn-js"

import type { WorkerExports } from './worker'

// Create a type-safe proxy to the worker
const worker = Comlink.wrap<WorkerExports>(
  new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
)

type NotarizationMethod = 'detailed' | 'simplified';

interface NotarizationOptions {
  method: NotarizationMethod;
  notaryUrl: string;
  websocketProxyUrl: string;
  apiEndpoint: string;
}

async function notarizeFrom0xZero(options: NotarizationOptions) {
  await worker.init({ loggingLevel: 'Info' });

  let presentationJSON: PresentationJSON | null = null;

  if (options.method === 'detailed') {
    presentationJSON = await notarizeDetailed(options);
  } else {
    presentationJSON = await notarizeSimplified(options);
  }

  if (presentationJSON) {
    return await verifyProof(presentationJSON, options.notaryUrl);
  }

  return null;
}

async function notarizeDetailed(options: NotarizationOptions): Promise<PresentationJSON | null> {
  try {
    const notary = await worker.NotaryServer.from(options.notaryUrl);
    const prover = await new worker.Prover({ serverDns: new URL(options.apiEndpoint).hostname });

    await prover.setup(await notary.sessionUrl());
    await prover.sendRequest(options.websocketProxyUrl, {
      url: options.apiEndpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const transcript = await prover.transcript();
    const commit: Commit = {
      sent: [
        transcript.ranges.sent.info!,
        transcript.ranges.sent.headers!['content-type'],
        transcript.ranges.sent.headers!['host'],
        ...transcript.ranges.sent.lineBreaks,
      ],
      recv: [
        transcript.ranges.recv.info!,
        transcript.ranges.recv.headers!['server'],
        transcript.ranges.recv.headers!['date'],
        // Add more specific ranges based on the 0xZero response
        ...transcript.ranges.recv.lineBreaks,
      ],
    };

    const notarizationOutputs = await prover.notarize(commit);

    const presentation = await new worker.Presentation({
      attestationHex: notarizationOutputs.attestation,
      secretsHex: notarizationOutputs.secrets,
      notaryUrl: notarizationOutputs.notaryUrl,
      websocketProxyUrl: notarizationOutputs.websocketProxyUrl,
      reveal: commit,
    });

    return await presentation.json();
  } catch (error) {
    console.error('Detailed notarization failed:', error);
    return null;
  }
}

async function notarizeSimplified(options: NotarizationOptions): Promise<PresentationJSON | null> {
  try {
    return await worker.Prover.notarize({
      notaryUrl: options.notaryUrl,
      websocketProxyUrl: options.websocketProxyUrl,
      url: options.apiEndpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      commit: {
        sent: [{ start: 0, end: 50 }],
        recv: [{ start: 0, end: 50 }],
      },
    });
  } catch (error) {
    console.error('Simplified notarization failed:', error);
    return null;
  }
}

async function verifyProof(presentationJSON: PresentationJSON, notaryUrl: string) {
  const proof = await new worker.Presentation(presentationJSON.data);
  const notary = await worker.NotaryServer.from(notaryUrl);
  const notaryKey = await notary.publicKey('hex');
  const verifierOutput = await proof.verify();
  const transcript = await new worker.Transcript({
    sent: verifierOutput.transcript.sent,
    recv: verifierOutput.transcript.recv,
  });
  const vk = await proof.verifyingKey();
  
  return {
    time: verifierOutput.connection_info.time,
    verifyingKey: Buffer.from(vk.data).toString('hex'),
    notaryKey: notaryKey,
    serverName: verifierOutput.server_name,
    sent: transcript.sent(),
    recv: transcript.recv(),
  };
}

// Usage example
async function runNotarization() {
  console.log('notarising')
  const result = await notarizeFrom0xZero({
    method: 'detailed', // or 'simplified'
    notaryUrl: 'https://tlsn.0xzero.org',
    websocketProxyUrl: 'ws://localhost:55688',
    apiEndpoint: 'https://swapi.dev/api/people/1'
  });

  if (result) {
    console.log('Notarization and verification successful:');
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('Notarization or verification failed.');
  }
}