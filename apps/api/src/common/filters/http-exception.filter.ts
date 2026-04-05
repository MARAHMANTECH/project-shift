// RFC 7807 Problem Details exception filter
// Ensures all API errors are returned in a standardized format

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Der opstod en intern fejl. Prøv venligst igen.";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>)["message"] as string ?? message;
    }

    const problemDetails: ProblemDetails = {
      type: `https://project-shift.dk/errors/${status}`,
      title: HttpStatus[status] ?? "Unknown Error",
      status,
      detail: typeof message === "string" ? message : JSON.stringify(message),
      instance: request.url,
    };

    response.status(status).json(problemDetails);
  }
}
