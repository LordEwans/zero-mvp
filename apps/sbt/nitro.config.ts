//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  runtimeConfig: {
    rpc: process.env.RPC,
    privateKey: process.env.PRIVATE_KEY,
    contract: process.env.CONTRACT,
  },
});
