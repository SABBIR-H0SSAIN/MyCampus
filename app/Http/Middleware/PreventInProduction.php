<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate local development/debug endpoints so they're unreachable in production.
 *
 * In production (APP_ENV=production) the request is short-circuited with a 404
 * that mirrors a "route not found" response, so the endpoint's existence isn't
 * even leaked to outside callers.
 *
 * Usage:
 *   Route::middleware(['prevent.production'])->group(function () { ... });
 */
class PreventInProduction
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('production')) {
            abort(404, 'Not Found.');
        }

        return $next($request);
    }
}
