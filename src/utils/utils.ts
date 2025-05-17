import http from "http";
import https from "https";

export async function validateURL(value: string): Promise<boolean> {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  const result = await urlRegex.test(value);
  console.log("URL validation result:", result);
  return result;
}

// validate user provided url is not broken
export async function isUrlBroken(url: string): Promise<boolean> {
  // Determine the module to use based on the URL protocol
  const client = url.startsWith("https") ? https : http;

  try {
    const response = await new Promise<http.IncomingMessage>(
      (resolve, reject) => {
        const request = client.get(url, resolve);
        request.on("error", reject);
        request.setTimeout(5000, () => {
          request.abort();
          reject(new Error("Request timed out"));
        });
      }
    );

    // Check the response status code
    return !(
      response.statusCode &&
      response.statusCode >= 200 &&
      response.statusCode < 400
    );
  } catch (err: any) {
    console.error("Error checking URL:", err.message || err);
    return true; // Error occurred, so URL is considered broken
  }
}
