import { hasHuman } from "../controllers/omid.controller";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await hasHuman(body.address);
  return {
    response: response,
  };
});
