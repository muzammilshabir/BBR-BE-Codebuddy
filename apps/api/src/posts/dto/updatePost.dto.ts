import { PartialType } from '@nestjs/swagger';
import { CreatePostDto, createPostSchema } from './createPost.dto';

export const updatePostSchema = createPostSchema.fork(['title', 'content'], (schema) =>
  schema.optional()
);

export class UpdatePostDto extends PartialType(CreatePostDto) {}
