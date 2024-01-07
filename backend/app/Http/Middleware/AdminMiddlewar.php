<?php

namespace App\Http\Middleware;

use Closure;
use Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddlewar
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::user()->isAdmin()) {
            if ($request->ajax()) {
                return response('Admin account required.', 401);
            } else {
                return redirect('/'); // set here any url you need
            }
        }
        
        return $next($request);
    }
}
