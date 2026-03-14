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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'shop_name' => 'required|string|max:255',
            'ninea' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'wave_number' => 'nullable|string|max:20',
            'om_number' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'agent',
        ]);

        $agent = Agent::create([
            'user_id' => $user->id,
            'shop_name' => $request->shop_name,
            'ninea' => $request->ninea,
            'address' => $request->address,
            'wave_number' => $request->wave_number,
            'om_number' => $request->om_number,
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
            'email' => 'required|email',
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
            'email' => 'Les informations d\'identification fournies ne correspondent pas à nos enregistrements.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}
