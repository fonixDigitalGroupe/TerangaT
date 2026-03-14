<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Agent;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AgentAuthController extends Controller
{
    public function showRegister()
    {
        return view('auth.register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users',
            'country' => 'required|string|max:100',
            'password' => 'required|numeric|digits:4|confirmed',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $request->first_name . ' ' . $request->last_name,
            'phone' => $request->phone,
            'country' => $request->country,
            'password' => Hash::make($request->password),
            'role' => 'agent',
        ]);

        $agent = Agent::create([
            'user_id' => $user->id,
            'shop_name' => 'Ma Boutique', // Default value or placeholder
        ]);

        Wallet::create([
            'agent_id' => $agent->id,
            'balance' => 0,
        ]);

        Auth::login($user);

        return redirect('/dashboard')->with('success', 'Bienvenue chez Téranga Trans !');
    }

    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'phone' => 'required|string',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            
            if (auth()->user()->isAgent()) {
                return redirect()->intended('/dashboard');
            }
            
            return redirect()->intended('/');
        }

        return back()->withErrors([
            'phone' => 'Les informations d\'identification fournies ne correspondent pas à nos enregistrements.',
        ])->onlyInput('phone');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}
