import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.Schema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value, { abortEarly: false });

    if (error) {
      throw new BadRequestException(this.formatErrors(error));
    }
    return value;
  }

  private formatErrors(error: Joi.ValidationError): string[] {
    return error.details.map(detail => detail.message);
  }
}
