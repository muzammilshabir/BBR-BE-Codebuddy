import * as mongoose from 'mongoose';
import { CustomHelpers, CustomValidator } from 'joi';

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

export const joiObjectIdValidator = (field: string): CustomValidator => {
  return (value: string, helpers: CustomHelpers) => {
    if (!isValidObjectId(value)) {
      return helpers.message({ custom: `Invalid ObjectId for ${field}` });
    }
    return value;
  };
};
