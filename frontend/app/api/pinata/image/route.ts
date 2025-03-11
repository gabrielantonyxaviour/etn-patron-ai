import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

export async function POST(req: NextRequest) {
    try {
        console.log("Received POST request");

        const formData = await req.formData();
        console.log("Form data parsed");
        const image = formData.get("image") as File;
        if (!image) {
            return NextResponse.json(
                { error: "Image file is required" },
                { status: 400 }
            );
        }

        try {
            const pinata = new PinataSDK({
                pinataJwt: process.env.PINATA_JWT,
                pinataGateway: "amethyst-impossible-ptarmigan-368.mypinata.cloud",
            });

            const upload = await pinata.upload.file(image);
            console.log("Image Upload successful:", upload);
            const url = await pinata.gateways.createSignedURL({
                cid: upload.cid,
                expires: 99999999999,
            });
            console.log(url);
            return NextResponse.json({ url }, { status: 200 });
        } catch (error) {
            console.error("Error uploading image to Pinata:", error);
            return NextResponse.json(
                { error: "Failed to upload image to Pinata" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
