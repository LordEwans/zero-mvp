import { getHuman } from "../controllers/omid.controller";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await getHuman(body.address);
  return {
    response: response,
  };
});
