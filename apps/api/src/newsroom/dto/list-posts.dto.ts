import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

export class ListNewsroomPostsDto extends ListPropsDto {
}

export const listNewsroomPostsSchema = PaginationSchema.append({
});
