import { Injectable } from '@nestjs/common';
import { ListPropsDto } from '../dto/listProps.dto';

interface IPaginationProps {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

export interface IPaginationEntity {
  limit: number;
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

@Injectable()
export class PaginationService {
  static prepareOptions(listPostDto: ListPropsDto): {
    limit: number;
    offset: number;
    sort: any;
  } {
    return {
      limit: listPostDto.limit,
      offset: listPostDto.limit * (listPostDto.page - 1),
      sort: [[listPostDto.sortBy, listPostDto.sortOrder === 'asc' ? 1 : -1]],
    };
  }

  constructor() {}

  static paginate(
    data: { rows: any[]; count: number },
    args: IPaginationProps
  ): { pagination: IPaginationEntity; data: any[] } {
    const totalDocs = data.count;
    const totalPages = Number(Math.ceil(totalDocs / args.limit));
    const hasNextPage = args.page < totalPages;
    const hasPrevPage = totalPages > 1 && args.page > 1 && args.page <= totalPages;
    const pagination = {
      limit: Number(args.limit),
      currentPage: Number(args.page),
      totalDocs,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
    return { pagination, data: data.rows };
  }

  static prepareSortQuery(sortOrder: string, orderBy: string) {
    const orderByDirection = sortOrder === 'asc' ? 1 : -1;
    return orderBy ? { [orderBy]: orderByDirection } : {};
  }
}
