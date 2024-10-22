import { ethers } from "ethers";
import { getBytes, hexlify, toUtf8Bytes } from "ethers";
import { keccak256 } from "ethers";

export const generateCircuitInputs = async (message: string, wallet: ethers.HDNodeWallet | ethers.Wallet) => {
  const messageHash = keccak256(toUtf8Bytes(message));
  const messageHashBytes = getBytes(messageHash);
  const signature = await wallet.signMessage(messageHashBytes);

  // Split signature into r, s components
  const sig = ethers.Signature.from(signature);
  
  // Get public key components
  const publicKey = wallet.signingKey.publicKey;
  // In v6, we need to handle public key computation differently
  const pubKeyPoint = ethers.SigningKey.computePublicKey(publicKey, true);
  const pubKeyBytes = getBytes(pubKeyPoint);
  
  // Format inputs according to circuit requirements
  const circuitInputs = {
    Sig: {
      R: sig.r,
      S: sig.s
    },
    Msg: messageHash,
    Pub: {
      X: hexlify(pubKeyBytes.slice(1, 33)), // Remove prefix and get x coordinate
      Y: hexlify(getBytes(ethers.SigningKey.computePublicKey(publicKey, false)).slice(33)) // Get y coordinate
    }
  };

  return {
    circuitInputs: JSON.stringify(circuitInputs),
    signature,
    messageHash
  };
};

// proof_generation.ts
import sindri from "sindri";

export const generateProof = async (message: string, wallet: ethers.HDNodeWallet | ethers.Wallet) => {
  const { circuitInputs } = await generateCircuitInputs(message, wallet);

  try {
    const proof = await sindri.proveCircuit(
      "verify-ecdsa:latest",
      circuitInputs
    );
    return proof;
  } catch (error) {
    console.error("Proof generation error:", error);
    return { error };
  }
};

// usage.ts
const message = "Hello World";
const wallet = ethers.Wallet.createRandom();

generateProof(message, wallet).then(console.log);

