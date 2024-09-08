
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from './classError.js';
export const cloudinaryConfig = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,// Click 'View API Keys' above to copy your API secret
    });
    return cloudinary
}

export const uploadFile = async ({ file, folder = "Gernral", publicId }) => {
    if (!file) {
        return next(new AppError("please upload image", 400))
    }
    let option = { folder }
    if (publicId) {
        option.public_id = publicId;
    }
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
        file,
        option,
    )

    return (secure_url, public_id)
}