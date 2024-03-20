import { Express } from "express";
import * as urlController from "./url.controllers";

import { getCookie } from "../middlewares/authJWT";

function urlRoutes(app: Express) {
  // redirector route
  app.get("/:shortCode", urlController.redirectToOriginalUrl);

  // get one URLs by id
  app.get("/url/:id", getCookie, urlController.getUrlById);
}

export default urlRoutes;
