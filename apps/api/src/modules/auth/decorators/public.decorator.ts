// @Public() decorator — markerer endpoints som offentlige (ingen auth krævet)
// Bruges med JwtAuthGuard til at bypasse autentificering på specifikke endpoints

import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Markér en controller eller handler som offentlig.
 * Endpoints dekoreret med @Public() kræver ingen autentificering.
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
