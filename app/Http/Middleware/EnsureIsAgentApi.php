<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAgentApi
{
    /**
     * Ensure the authenticated user is an agent with a wallet, returning JSON on failure.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAgent() || ! $user->agent) {
            return response()->json(['message' => 'Accès réservé aux agents.'], 403);
        }

        return $next($request);
    }
}
