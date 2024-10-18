const { google } = require("googleapis");
const stream = require("stream");

// Upload files to Google Drive
async function fileUploader(keyFileLocation, parentId, files) {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFileLocation,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });
      const drive = google.drive({
        version: "v3",
        auth,
      });
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        const response = await drive.files.create({
          requestBody: {
            name: file.originalname,
            mimeType: file.mimetype,
            parents: [parentId],
          },
          media: {
            body: bufferStream,
          },
        });
        const fileUrl = `https://drive.google.com/file/d/${response.data.id}/view?usp=sharing`;
        uploadedFiles.push({ ...response.data, url: fileUrl });
      }
      return uploadedFiles;
    } catch (e) {
      throw e;
    }
  }

async function downloadFile(keyFileLocation, fileId) {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFileLocation,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const drive = google.drive({ version: "v3", auth });
  
    try {
      // Request to download the file as a stream
      const response = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
  
      // Create headers object
      const headers = {
        'Content-Disposition': `attachment; filename="${fileId}.zip"`,
        'Content-Type': 'application/octet-stream',
      };
  
      // Return the stream and headers
      return { stream: response.data, headers };
  
    } catch (error) {
      console.error("Error downloading file from Google Drive:", error.message);
      throw new Error("Failed to download the file from Google Drive.");
    }
  }

// Delete a file from Google Drive
async function deleteFile(keyFileLocation, fileId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFileLocation,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const drive = google.drive({ version: "v3", auth });
  await drive.files.delete({ fileId });
  return `File with ID: ${fileId} deleted successfully`;
}

module.exports = { fileUploader, downloadFile, deleteFile };
