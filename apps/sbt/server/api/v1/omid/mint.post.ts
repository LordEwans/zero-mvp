import { mint } from "../controllers/omid.controller";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await mint(body.address);
  return {
    response: response,
  };
});
