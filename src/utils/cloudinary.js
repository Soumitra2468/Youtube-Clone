import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import e from 'express';
import fs from 'fs';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error('File path is required for image upload');
        }
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto'
        });
        console.log('Image uploaded to Cloudinary:', result.secure_url);
        return result.secure_url;
    } catch (error) {
       fs.unlinkSync(filePath, (err) => {
        // Delete the file during uploding attemption has failed
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
}

export {uploadImage}