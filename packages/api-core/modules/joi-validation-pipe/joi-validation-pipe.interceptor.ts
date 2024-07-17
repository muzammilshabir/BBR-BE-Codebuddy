import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Paramtype,
  PipeTransform,
} from '@nestjs/common';
import { Schema } from 'joi';

// Can be used to validate request body, query and params.
// In case it does not work, use transform(value: any, metadata: ArgumentMetadata) with switch-case
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(
    private schema: Schema,
    private type: Paramtype
  ) {}

  private validate(value: any) {
    const { error, value: validatedValue } = this.schema.validate(value, {
      allowUnknown: false,
      errors: {
        wrap: {
          label: false,
        },
      },
    });

    if (error) {
      throw new BadRequestException(error.details[0].message);
    }
    return validatedValue;
  }

  transform(value: any, metadata: ArgumentMetadata) {
    if (this.type === metadata.type) {
      return this.validate(value);
    }

    return value;
  }
}
