import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BaseModel } from "src/entites/base.entity";
import { BasePaginationDto } from "./dto/base-pagination.dto";
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from "typeorm";
import { FILTER_MAPPER } from "./const/filter-mapper.const";

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {}
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string
  ) {
    const findOptions = this.composeFindOptions<T>(dto);
    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const protocol = this.configService.get<string>("PROTOCOL");
    const host = this.configService.get<string>("HOST");

    const nextUrl = lastItem && new URL(`${protocol}://${host}/${path}`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== "where__id__more_than" &&
            key !== "where__id__less_than"
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === "ASC") {
        key = "where__id__more_than";
      } else {
        key = "where__id__less_than";
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith("where__")) {
        where = {
          ...where,
          ...this.parseFilter(key, value),
        };
      } else if (key.startsWith("order__")) {
        order = {
          ...order,
          ...this.parseFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseFilter<T extends BaseModel>(
    key: string,
    value: any
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};

    // key 예시) where__id__more_than
    const split = key.split("__");

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야합니다 - 문제되는 키값 : ${key}`
      );
    }

    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split;
      options[field] = value;
    } else {
      // where__id__more_than의 경우  where는 버려도 되고 두번째 값은 필터할 키값이 되고 세번째 값은 typeorm 유틸리티가 된다.
      const [_, field, operator] = split;

      if (operator === "i_like") {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }

    return options;
  }
}
