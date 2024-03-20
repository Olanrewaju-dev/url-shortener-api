import { Request, Response } from "express";
import { UrlModel } from "./url.model";
import { redisClient } from "../config/redisConfig";

// GET one URL by ID
export const getUrlById = async (req: Request, res: Response) => {
  try {
    const urlId = req.params.id;
    // checking if URLs are cached before making call to DB
    const cachedURL = await redisClient.get(`${urlId}`);
    if (cachedURL) {
      res.status(200).send({
        message: "Cache hit. URL successfully retrieved.",
        data: JSON.parse(cachedURL),
      });
      return;
    }
    const url = await UrlModel.findOne({ urlId: req.params.id }); // find the url by id
    if (url) {
      await UrlModel.updateOne(
        {
          urlId: req.params.id,
        },
        { $inc: { clicks: 1 } } // increment the clicks by 1
      );
      await redisClient.setEx(`${urlId}`, 43200, JSON.stringify(url)); // caching the URL for 12 hours
      res.redirect(url.origUrl);
      // res.status(200).send({
      //   message: "Original url retrieved successfully",
      //   data: url,
      // });
    } else {
      res.status(404).send({
        message: "URL not found in the database",
        data: [],
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: err.message,
    });
  }
};

export const redirectToOriginalUrl = async (req: Request, res: Response) => {
  const shortCode = req.params.shortCode;
  console.log("i got here - redirectToOrignalUrl");

  try {
    const shortUrl = await UrlModel.findOne({ shortCode });
    if (!shortUrl) {
      return res.status(404).send("Short URL not found");
    }

    return res.redirect(shortUrl.origUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};
