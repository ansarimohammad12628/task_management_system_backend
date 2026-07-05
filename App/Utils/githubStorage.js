const fs = require("fs");
const axios = require("axios");

const IMAGE_USERNAME = process.env.IMAGE_USERNAME;
const IMAGE_REPO = process.env.IMAGE_REPO;
const IMAGE_TOKEN = process.env.IMAGE_TOKEN;
const IMAGE_BRANCH = process.env.IMAGE_BRANCH;
const BASE_IMAGE_REPO = process.env.BASE_IMAGE_REPO;

/**
 * Upload File To GitHub
 */

const uploadFileToGithub = async ({
  file,
  folder = "",
  subfolder = "",
  customFileName,
  commitMessage,
}) => {
  try {
    if (!file) {
      return {
        success: false,
        message: "File not found.",
      };
    }

    const extension = file.originalname.split(".").pop();

    const fileName = customFileName
      ? `${customFileName}.${extension}`
      : `${Date.now()}.${extension}`;

    const relativePath = `${folder}/${subfolder}/${fileName}`;

    const fileContent = fs.readFileSync(file.path, {
      encoding: "base64",
    });

    const githubUrl = `https://api.github.com/repos/${IMAGE_USERNAME}/${IMAGE_REPO}/contents/${relativePath}`;

    let sha = null;

    try {
      const oldFile = await axios.get(githubUrl, {
        headers: {
          Authorization: `Bearer ${IMAGE_TOKEN}`,
        },
        params: {
          ref: IMAGE_BRANCH,
        },
      });

      sha = oldFile.data.sha;
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    const upload = await axios.put(
      githubUrl,
      {
        message: commitMessage || `Upload ${fileName}`,
        content: fileContent,
        branch: IMAGE_BRANCH,
        ...(sha && { sha }),
      },
      {
        headers: {
          Authorization: `Bearer ${IMAGE_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      success: true,
      message: "File uploaded successfully.",
      data: {
        fileName,
        relativePath,
        download_url: upload.data.content.download_url,
        sha: upload.data.content.sha,
      },
    };
  } catch (error) {
    console.log(error.response?.data || error.message);

    return {
      success: false,
      message: "GitHub upload failed.",
      error: error.message,
    };
  }
};

/**
 * Delete File
 */

const deleteFileFromGithub = async (relativePath) => {
  try {
    const metadataUrl = `https://api.github.com/repos/${IMAGE_USERNAME}/${IMAGE_REPO}/contents/${relativePath}?ref=${IMAGE_BRANCH}`;

    const metadata = await axios.get(metadataUrl, {
      headers: {
        Authorization: `Bearer ${IMAGE_TOKEN}`,
      },
    });

    const sha = metadata.data.sha;

    await axios.delete(
      `https://api.github.com/repos/${IMAGE_USERNAME}/${IMAGE_REPO}/contents/${relativePath}`,
      {
        headers: {
          Authorization: `Bearer ${IMAGE_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        data: {
          message: `Delete ${relativePath}`,
          sha,
          branch: IMAGE_BRANCH,
        },
      }
    );

    return {
      success: true,
      message: "File deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Delete failed.",
      error: error.message,
    };
  }
};

/**
 * Raw File URL
 */

const getGithubFileUrl = (relativePath) => {
  if (!relativePath) return null;

  return `https://raw.githubusercontent.com/${BASE_IMAGE_REPO}/${IMAGE_BRANCH}/${relativePath}`;
};


/**
 * Construct a Server raw content URL
 */
const getServerRawUrl = (relativePath, repo = BASE_IMAGE_REPO, branch = IMAGE_BRANCH) => {
  if (!relativePath) return null;
  return `https://raw.githubusercontent.com/${repo}/${branch}/${relativePath}`;
};

/**
 * Fetch file stream from Server
 */
const fetchServerFileStream = async (fileUrl) => {
  if (!fileUrl) {
    return {
      success: false,
      status: 400,
      error: "Server URL is required",
    };
  }

  try {
    const response = await axios.get(fileUrl, {
      headers: {
        Authorization: `token ${IMAGE_TOKEN}`,
      },
      responseType: "stream",
    });

    return {
      success: true,
      contentType: response.headers["content-type"],
      stream: response.data,
    };
  } catch (error) {
    console.error("Server Fetch Error:", error.message);
    return {
      success: false,
      status: error.response?.status || 500,
      error: "Failed to fetch file from Server",
    };
  }
};


module.exports = {
  uploadFileToGithub,
  deleteFileFromGithub,
  getGithubFileUrl,
  getServerRawUrl,
  fetchServerFileStream,
};