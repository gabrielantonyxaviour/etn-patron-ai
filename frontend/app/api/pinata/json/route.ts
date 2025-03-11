import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

export async function POST(req: NextRequest) {
    try {
        console.log("Received POST request");

        const formData = await req.formData();
        console.log("Form data parsed");

        const jsonObject = formData.get("jsonObject") as File;
        const name = formData.get("name");

        if (!jsonObject || !name) {
            return NextResponse.json(
                { error: "JSON file and name are required" },
                { status: 400 }
            );
        }

        try {
            const pinata = new PinataSDK({
                pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
                pinataGateway: "amethyst-impossible-ptarmigan-368.mypinata.cloud",
            });
            const jsonString = JSON.stringify(jsonObject, null, 2);
            const file = new File([jsonString], name + ".json", {
                type: "application/json",
            });
            const upload = await pinata.upload.file(file);
            console.log("JSON Upload successful:", upload);
            const uri = await pinata.gateways.createSignedURL({
                cid: upload.cid,
                expires: 99999999999,
            });
            console.log(uri);
            const hash = createHash("sha256")
                .update(JSON.stringify(jsonObject))
                .digest("hex");
            return NextResponse.json({ uri, hash }, { status: 200 });
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
