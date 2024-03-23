const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

function configureMulter() {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'tmp');
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}.${file.originalname.split('.').pop()}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/gif'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
    }
  };

  const upload = multer({ storage, fileFilter });
  return upload;
}

module.exports = configureMulter;