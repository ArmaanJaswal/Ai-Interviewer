import multer from "multer";

// Configure in-memory storage for handling audio uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow common audio mime types
  if (
    file.mimetype.startsWith("audio/") ||
    file.mimetype === "video/webm" ||
    file.mimetype === "application/octet-stream"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed"), false);
  }
};

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit for Whisper API
  },
  fileFilter,
});
