//import { v2 } from "cloudinary";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { ApiError } from "./ApiError";

dotenv.config();



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,// Click 'View API Keys' above to copy your API secret
    // cloud_url: process.env.CLOUDINARY_URL
});

console.log("\n=== CHECKING ENVIRONMENT VARIABLES ===");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING");
console.log("CLOUDINARY_URL:", process.env.CLOUDINARY_URL);
console.log("=====================================\n");


const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        console.log("response", response.url);
        console.log("localFilePath", localFilePath);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath);// remove the file from local uploads folder
        return null;
    }

}

const deleteToCloudinary = async (image) => {
    try {
        if (!image) {
            throw new ApiError(404, "Image Invalid")
        }
        const publicId = extractPublicId(image)
        const response = await cloudinary.uploader.destroy(publicId)
        if (response.reslt != "ok") {
            throw new ApiError(404, "Old Image Deletion Failed from Cloudinary")
        }
    } catch (error) {
        console.log(error, "error in deleting image from cloudinary");
        return null
    }
}







export { uploadToCloudinary, deleteToCloudinary };