/**
 * Security-headers middleware (Lab 05 — Security Misconfiguration scenario).
 *
 * Headers added:
 *   X-Content-Type-Options: nosniff
 *     Prevents browsers from MIME-sniffing a response away from the declared content-type.
 *     Without it, a browser might execute a JSON file uploaded by a user as a script.
 *
 *   X-Frame-Options: DENY
 *     Blocks the app from being embedded in <iframe>, protecting against clickjacking.
 *
 *   Referrer-Policy: no-referrer
 *     Suppresses the Referer header on outgoing requests so internal URLs
 *     are not leaked to third-party servers.
 *
 *   X-XSS-Protection: 0
 *     Explicitly disables the legacy XSS auditor (IE/old Chrome).
 *     The modern best-practice is to rely on CSP instead of the broken auditor.
 */
import type { Request, Response, NextFunction } from 'express';

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  next();
}
