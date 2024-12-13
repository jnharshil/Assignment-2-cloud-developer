import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL) {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch the image using Axios
            const response = await axios.get(inputURL, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            // Generate a unique output path in the /tmp directory
            const tmpDir = '/tmp';
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }
            const outpath = path.join(tmpDir, `filtered_${Date.now()}.jpg`);

            // Process the image using Sharp
            await sharp(imageBuffer)
                .resize(256, 256) // Resize to 256x256
                .grayscale() // Apply grayscale filter
                .jpeg({ quality: 60 }) // Set JPEG quality
                .toFile(outpath);

            resolve(outpath);
        } catch (error) {
            console.error('Error processing the image:', error);
            reject(`Error processing the image: ${error.message}`);
        }
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files) {
    for (const file of files) {
        try {
            fs.unlinkSync(file);
        } catch (error) {
            console.error(`Error deleting file ${file}:`, error);
        }
    }
}
