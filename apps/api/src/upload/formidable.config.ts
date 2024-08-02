import formidable from 'formidable';

export const formidableOptions: formidable.Options = {
  multiples: true,
  maxFileSize: 512 * 1024 * 1024,
  allowEmptyFiles: false,
  keepExtensions: true,
};
