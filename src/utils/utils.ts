import http from "http";
import https from "https";

export function validateURL(value: string): boolean {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(value);
}

// validate user provided url is not broken
export async function isUrlBroken(url: string): Promise<boolean> {
  // Determine the module to use based on the URL protocol
  const client = url.startsWith("https") ? https : http;

  try {
    const response = await new Promise<http.IncomingMessage>(
      (resolve, reject) => {
        client.get(url, resolve).on("error", reject);
      }
    );

    // Check the response status code
    if (
      response.statusCode &&
      response.statusCode >= 200 &&
      response.statusCode < 400
    ) {
      console.log("URL is not broken");
      return false; // URL is not broken
    } else {
      console.log("URL is broken");
      return true; // URL is broken
    }
  } catch (err: any) {
    console.error("Error checking URL:", err);
    return true; // Error occurred, so URL is considered broken
  }
}
