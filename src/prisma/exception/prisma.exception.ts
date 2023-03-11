import { BadRequestException, HttpException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function primsaErrorHandling(error: any) {
  console.log(error);

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new ServiceUnavailableException();
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new BadRequestException({
      message: error.meta ? error.meta.target : error.name,
    });
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    throw new HttpException({ message: 'Insufficient Data' }, HttpStatus.BAD_REQUEST);
  } else if (error instanceof Error) {
    throw error;
  } else {
    throw new HttpException({ message: 'Something went wrong' }, HttpStatus.BAD_REQUEST);
  }
}
