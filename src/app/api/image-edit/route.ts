import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Helper function to simulate model overload (80% chance)
function simulateModelOverload(): boolean {
  return Math.random() < 0.2;
}

// Helper function for sleeping/delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Process image edit with retries
async function processImageEdit(
  openai: OpenAI,
  image: File,
  prompt: string,
  signal?: AbortSignal,
  maxRetries = 3
): Promise<any> {
  let attempt = 1;

  // Create a promise that rejects when the signal aborts
  const abortPromise = new Promise((_, reject) => {
    if (signal) {
      if (signal.aborted) {
        reject(new Error("Request aborted"));
      }
      signal.addEventListener("abort", () => {
        reject(new Error("Request aborted"));
      });
    }
  });

  while (attempt <= maxRetries) {
    try {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error("Request aborted");
      }

      // Simulate model overload error
      if (simulateModelOverload() && attempt < maxRetries) {
        console.log(`Attempt ${attempt}: Simulating model overload error`);
        throw { message: "Model overloaded" };
      }

      // Race between the API call and abort promise
      const apiPromise = openai.images.edit({
        model: "gpt-image-1",
        image: image,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      const response = await Promise.race([apiPromise, abortPromise]);
      return response;
    } catch (error: any) {
      // Throw immediately if aborted
      if (error.message === "Request aborted" || signal?.aborted) {
        console.log("Request was aborted by the user");
        throw error;
      }

      // Handle model overload with retry
      if (error.message === "Model overloaded" && attempt < maxRetries) {
        const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff in ms
        console.log(`Model overloaded. Retrying in ${backoffTime / 1000} seconds...`);

        // Check for abort during the sleep
        try {
          await Promise.race([
            sleep(backoffTime),
            abortPromise
          ]);
        } catch (abortError) {
          throw abortError; // Propagate the abort
        }

        attempt++;
      } else {
        // Either it's not a model overload error or we've reached max retries
        throw error;
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const prompt =
      (formData.get("prompt") as string) ||
      "Enhance this image with beautiful styling";
    const style = formData.get("style") as string;

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Get the abort signal from the request
    const signal = request.signal;

    // Process the image edit with retry capability and pass the signal
    const response = await processImageEdit(openai, image, prompt, signal, 3);

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: "No image data received from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: response.data[0],
      usage: response.usage,
      style: style,
      prompt: prompt,
      createdAt: response.created,
    });
  } catch (error: any) {
    console.error("Image edit error:", error);

    // Handle aborted requests differently
    if (error.name === 'AbortError' || error.message === 'Request aborted') {
      return NextResponse.json(
        { error: "Request cancelled by user" },
        { status: 499 } // 499 is commonly used for client closed request
      );
    }

    return NextResponse.json(
      { error: "Failed to process image edit" },
      { status: 500 }
    );
  }
}
