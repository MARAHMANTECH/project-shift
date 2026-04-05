// Zod validation pipe for NestJS
// Validates request bodies/queries against Zod schemas at runtime
// Returns RFC 7807 errors on validation failure

import {
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        throw new BadRequestException({
          message: "Valideringsfejl i request data.",
          errors: details,
        });
      }
      throw error;
    }
  }
}
