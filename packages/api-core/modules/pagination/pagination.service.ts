import { Injectable } from '@nestjs/common';

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
  constructor() {}

  static paginate(count: number, args: IPaginationProps): IPaginationEntity {
    const totalDocs = count;
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
    return pagination;
  }

  static prepareSortQuery(sortOrder: string, orderBy: string) {
    const orderByDirection = sortOrder === 'asc' ? 1 : -1;
    return orderBy ? { [orderBy]: orderByDirection } : {};
  }
}
