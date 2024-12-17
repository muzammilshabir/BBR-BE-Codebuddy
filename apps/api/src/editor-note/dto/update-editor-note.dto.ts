import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { NoteDto, noteSchema } from './create-editor-note.dto';

export class UpdateEditorNoteDto {
  @ApiProperty({ description: 'Editor notes', required: true })
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

export const updateEditorNoteSchema = Joi.object({
  notes: Joi.array().items(noteSchema).max(4).min(4).required().messages({
    'array.max': 'A residence can only have a maximum of 4 editor notes.',
    'any.required': 'Notes are required.',
  }),
});
