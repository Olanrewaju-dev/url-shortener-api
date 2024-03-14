import { Express } from "express";
import * as urlController from "./url.controllers";

function urlRoutes(app: Express) {
  // get all URLs
  app.get("/url", urlController.getAllUrls);

  // get one URLs by id
  app.get("/url/:id", urlController.getUrlById);

  // create a URLs in the database
  app.post("/url", urlController.createUrl);

  // create a custom URL in the database
  app.post("/url/custom-domain", urlController.createCustomUrl);

  // delete a URl by id
  app.delete("/url/:id", urlController.deleteUrlById);
}

export default urlRoutes;
