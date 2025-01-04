"use server";

import axios from "axios";

const jwt = process.env.JWT;

export const uploadFileToIPFS = async (data: FormData) => {
    const file = data.get('file') as File | null;
    if (file) {
        const pinataMetadata = JSON.stringify({
            name: file.name,
        });
        data.append("pinataMetadata", pinataMetadata);

        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        });
        data.append("pinataOptions", pinataOptions);

        try {
            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${(data as any)._boundary}`,
                    Authorization: `Bearer ${jwt}`,
                },
            });

            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
            };

        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: (error as Error).message,
            };
        }
    } else {
        return {
            success: false,
            message: "File not found in FormData",
        };
    }
};