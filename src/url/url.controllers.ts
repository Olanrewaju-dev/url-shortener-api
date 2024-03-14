import { Request, Response } from "express";
import shortId from "short-uuid";
import { validateURL, isUrlBroken } from "../utils/utils";
import { UrlModel } from "./url.model";
import dns from "dns/promises";
import { redisClient } from "../config/redisConfig";

// GET all URLs
export const getAllUrls = async (req: Request, res: Response) => {
  try {
    // checking if URLs are cached before making call to DB
    const cachedURL = await redisClient.get("allURLs");
    if (cachedURL) {
      res.status(200).send({
        message: "Cache hit. Shortened URLs successfully retrieved.",
        data: JSON.parse(cachedURL),
      });
      return;
    }

    // making call to DB if URLs are not cached
    const urls = await UrlModel.find();
    if (urls) {
      await redisClient.setEx("allURLs", 43200, JSON.stringify(urls)); // caching the URL for 12 hours
      res.status(200).send({
        message: "All shortened URLs retrieved successfully",
        data: urls,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: err.message,
    });
  }
};

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
      res.status(200).send({
        message: "Original url retrieved successfully",
        data: url,
      });
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

// POST a new shortened URL
export const createUrl = async (req: Request, res: Response) => {
  const { origUrl } = req.body;

  // setting the base url
  const base = process.env.URL_BASE || "https://localhost:3000";
  // generating a random url id
  const urlId = shortId.generate().slice(0, 6);
  let urlBrokenCheck = await isUrlBroken(origUrl);

  // check if the original url is valid and not broken
  if (validateURL(origUrl) && urlBrokenCheck === false) {
    try {
      // check if the url already exists
      let url = await UrlModel.findOne({ origUrl });
      if (url) {
        // if it exists, return the url and a valid error message
        res.status(403).send({
          message: "URL already exists",
          data: url,
        });
      } else {
        // if it doesn't exist, create a new short url by concatenating the base url and the url id
        const shortUrl = `${base}/${urlId}`;

        // create an object containing new url, original url as well as other neccessary parameters and store it in the database
        let newUrlObj = await UrlModel.create({
          origUrl,
          shortUrl,
          urlId,
          clicks: 0,
          date: new Date(),
        });

        res.status(201).send({
          message: "short URL created successfully",
          data: newUrlObj,
        });
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  } else {
    res.status(400).send({
      message: "Invalid Original Url",
    });
  }
};

// Create new custom shortened URL
export const createCustomUrl = async (req: Request, res: Response) => {
  try {
    const { origUrl, customDomain } = req.body;

    // validate the custom domain using node dns lookup
    let validCusDom = await dns.resolve(customDomain);
    let urlBrokenCheck = await isUrlBroken(origUrl);

    // check if the custom domain is valid
    if (validateURL(origUrl) && validCusDom && urlBrokenCheck === false) {
      // check if the custom domain is already in db
      let domainCheck = await UrlModel.findOne({ origUrl });
      if (domainCheck) {
        // if it exists, return the existing shortened URL and a valid error message
        res.status(403).send({
          message: "URL already exists!!!",
          data: domainCheck,
        });
      } else {
        // if it doesn't exist, create a new short url by concatenating the base url and the url id
        const urlId = shortId.generate().slice(0, 6);
        const newCustomUrl = `https://${customDomain}/${urlId}`;

        // Create a new custom URL
        let dbPayLoad = await UrlModel.create({
          origUrl,
          shortUrl: newCustomUrl,
          urlId,
          clicks: 0,
          date: new Date(),
        });

        // Return success response
        res.status(201).send({
          message: "Custom URL created successfully",
          customUrl: dbPayLoad,
        });
      }
    } else {
      res.status(500).send({
        message: "URL is broken! Check the URL",
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// DELETE a URL by ID
export const deleteUrlById = async (req: Request, res: Response) => {
  try {
    const deletedUrl = await UrlModel.findByIdAndDelete(req.params.id);
    if (deletedUrl) {
      res.status(200).send({
        message: "URL deleted successfully",
        data: deletedUrl,
      });
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
