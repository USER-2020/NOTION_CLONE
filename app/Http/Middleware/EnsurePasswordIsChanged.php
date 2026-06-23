<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    public function handle(Request $request, Closure $next): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user || ! $user->must_change_password) {
            return $next($request);
        }

        if ($request->routeIs('profile.edit', 'profile.update', 'password.update', 'logout')) {
            return $next($request);
        }

        return redirect()
            ->route('profile.edit')
            ->with('status', 'Debes cambiar tu contrasena antes de continuar.');
    }
}
