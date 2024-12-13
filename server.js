import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public URL.
// It should:
//    1. Validate the image_url query
//    2. Call filterImageFromURL(image_url) to filter the image
//    3. Send the resulting file in the response
//    4. Delete any files on the server when the response is finished
// QUERY PARAMETERS
//    image_url: URL of a publicly accessible image
// RETURNS
//    The filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

app.get("/filteredimage", async (req, res) => {
    const { image_url } = req.query;

    if (!image_url) {
        return res.status(400).send({ message: "image_url is required or malformed" });
    }

    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    const regex = new RegExp(expression);

    if (!image_url.match(regex)) {
        return res.status(400).send({ message: "image_url is required or malformed" });
    }

    if (
        !image_url.toLowerCase().endsWith(".jpeg") &&
        !image_url.toLowerCase().endsWith(".jpg") &&
        !image_url.toLowerCase().endsWith(".png") &&
        !image_url.toLowerCase().endsWith(".bmp") &&
        !image_url.toLowerCase().endsWith(".tiff")
    ) {
        return res.status(400).send({ message: "Image type not supported" });
    }

    try {
        const filteredImagePath = await filterImageFromURL(image_url);
        res.sendFile(filteredImagePath, async (err) => {
            if (err) {
                return res.status(500).send({ message: 'Error sending the file' });
            }

            await deleteLocalFiles([filteredImagePath]);
        });
    } catch (error) {
        return res.status(404).send({ message: "Image not found" });
    }
});

// Root Endpoint
app.get("/", (req, res) => {
    res.send("Try GET /filteredimage?image_url={{URL}}");
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log("Press CTRL+C to stop server");
});
