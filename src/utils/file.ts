import multer from 'multer';
import path from 'path';
import { HttpException } from '../types/exception';

export const uploadIgerFileFilter = multer({
  fileFilter(req, file, callback: multer.FileFilterCallback) {
    const ext = path.extname(file.originalname);
    if (ext !== '.iger') {
      return callback(new HttpException(400, 'Invalid File Extension'));
    }

    return callback(null, true);
  },
});
