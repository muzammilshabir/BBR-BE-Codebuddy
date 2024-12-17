import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class NoteDto {
  @ApiProperty({
    required: true,
    example: 'On-site Amenities',
    description: 'Topic of the note',
  })
  topic: string;

  @ApiProperty({
    required: true,
    example:
      'The residence offers various on-site amenities including a gym, swimming pool, and communal workspace.',
    description: 'Detailed description of the note',
  })
  description: string;
}

export class CreateEditorNoteDto {
  @ApiProperty({
    example: '60d9c6a0a11c3c6c6a9a1a2b',
    required: true,
    description: 'Unique identifier of the residence',
  })
  residenceId: string;

  @ApiProperty({
    description: 'Editor notes for the residence',
    required: true,
    example: [
      {
        topic: 'On-site Amenities',
        description:
          'The residence offers various on-site amenities including a gym, swimming pool, and communal workspace.',
      },
      {
        topic: 'Location Highlights',
        description: 'Conveniently located near public transportation and local shopping centers.',
      },
    ],
  })
  notes: NoteDto[];
}

export const noteSchema = Joi.object({
  topic: Joi.string().required().messages({
    'any.required': 'Topic is required.',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required.',
  }),
});

export const createEditorNoteSchema = Joi.object({
  residenceId: Joi.string().required().custom(joiObjectIdValidator('residenceId')),
  notes: Joi.array().items(noteSchema).max(4).min(4).required().messages({
    'array.max': 'A residence can only have a maximum of 4 editor notes.',
    'any.required': 'Notes are required.',
  }),
});
