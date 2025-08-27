import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

        // Create the image edit request with the image file directly
        const response = await openai.images.edit({
            model: "gpt-image-1",
            image: image,
            prompt: prompt,
            n: 1,
            size: "1024x1536",
        });

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
    } catch (error) {
        console.error("Image edit error:", error);
        return NextResponse.json(
            { error: "Failed to process image edit" },
            { status: 500 }
        );
    }
}
