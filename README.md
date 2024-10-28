<p align="center">
  <img src="./apps/wallet/assets/icon.png" width="300" alt="0xzero.org" />
</p>

# ZERO MVP

[![Rust CI](https://github.com/0xZeroLabs/zero-mvp/actions/workflows/rust-ci.yml/badge.svg)](https://github.com/0xZeroLabs/zero-mvp/actions/workflows/rust-ci.yml)

Welcome to the base of all of our code. Feel free to look around.

## What are we building?
**ZERO Protocol,** a privacy preserving decentralised identity protocol that aims to enable complete data self-sovereignty. The **OMID (omni-identity) Wallet,** an application that enables users interact with the ZERO Protocol.

The aim of this prototype is to test out our concept of verifiable credentials through trusted notaries (notarized credentials).

With regular verifiable credentials, the issuer is required to set up a system to enable them sign the data authencity in order to enable provenance. This ensures that when a user selectively discloses their identity data (e.g., through zkps), we can be rest assured that the data is untampered.
<p align="center">
  <img src="./apps/wallet/assets/vc.png" width="600" alt="0xzero.org" />
</p>

This however, creates a noticeable issue with current identity solutions. Lack of industry adoption. **Issuers** don't care about providing

After months of research, we decided to take a different approach. One we think is more optimal—trusted notaries. Our choice for a notary platform was TLSN—due to time constraints, we couldn't make any necessary changes for our system. TLSN uses the same technology behind what is commonly known as zkTLS (web proofs).
<p align="center">
  <img src="./apps/wallet/assets/nc.png" width="600" alt="0xzero.org" />
</p>

With VCs rely on the issuer to sign the data's authenticity, NCs however, only requires a secure third party (notary). This reduces the barrier to entry for issuers as they are no longer required to adopt any new system. We also hope to create an open identity ecosystem, where almost any credential data that is privately accessible to users can be put in their possession using a schema based system that anyone can participate in writing.

With our protocol, there'll be no data silos for verifiers, no barrier to entry for issuers!

## What's inside?

A Turborepo which includes the following packages/apps:

### Apps and Packages

- `@0xzerolabs/wallet`: For this prototype, we built a simple iteration of the wallet with [Plasmo](https://docs.plasmo.com/), designed to be self-custodial. It requires seed phrase/private keys importation.
- `@0xzerolabs/sbt`: A Nitro server that currently makes commitments on-chain. It includes a [Solidity](https://soliditylang.org/) and [Foundry](https://foundry.sh) soulbound token smart contract. Minting, deleting, and fetching are all currently permissionless. However updating/creating credentials is permissioned by an operator to verify credentials before writing commitments on-chain. Eventually, we hope to make onchain commitments permissioned by a commitee of trusted notaries.
- `@0xzerolabs/session`: 
- `@0xzerolabs/ui`: a stub component library shared by all the applications
- `@0xzerolabs/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)

Not all of the `package/app` is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd zero-mvp
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd zero-mvp
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd zero-mvp
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
