import sindri from "sindri";
import * as ethUtil from 'ethereumjs-util';

const privKey = process.env.PRIVATE_KEY as string;
const message = "Hello World";
let pubKey;

export const generate = async (X: string, Y: string, type: string) => {
  const circuitIdentifier = `${type}:latest`;
  const proofInput = { X, Y };

  try {
    const proof = await sindri.proveCircuit(
      circuitIdentifier,
      JSON.stringify(proofInput)
    );
    return proof;
  } catch (error) {
    return { error };
  }
};

const signMessage = (message: string, privateKey: string): string => {
  const messageHash = ethUtil.hashPersonalMessage(Buffer.from(message));
  const signature = ethUtil.ecsign(messageHash, Buffer.from(privateKey, 'hex'));
  return `0x${signature.r.toString('hex')}${signature.s.toString('hex')}${signature.v.toString(16)}`;
};

const getPublicKey = (privateKey: string): string => {
  const publicKey = ethUtil.privateToPublic(Buffer.from(privateKey, 'hex'));
  return `0x${publicKey.toString('hex')}`;
};

console.log(signMessage(message, privKey), "\n", message, "\n", getPublicKey(privKey));

generate("18", "18", 'verifyecdsa').then(console.log)
