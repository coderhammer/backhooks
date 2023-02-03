import * as express from "express";
import HooksMiddleware from "@backhooks/express";
import { mainHandler } from "../handlers";
import { useLogger } from "../hooks/useLogger";

const app = express();

app.use(HooksMiddleware());

app.get("/", async (req, res, next) => {
  try {
    const logger = useLogger();
    logger.debug("This is a request log.");
    res.send(await mainHandler());
  } catch (error) {
    next(error);
  }
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
