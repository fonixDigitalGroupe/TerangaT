<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Agent;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'country' => 'required|string|max:100',
            'shop_name' => 'nullable|string|max:34',
            'password' => 'required|numeric|digits:4|confirmed',
        ]);

        // Le numéro doit avoir été vérifié par OTP (voir checkOtp).
        if (! Cache::pull('otp_ok:' . $data['phone'])) {
            throw ValidationException::withMessages([
                'phone' => ['Numéro non vérifié. Reprenez l\'inscription.'],
            ]);
        }

        $shop = $data['shop_name'] ?? 'Ma Boutique';
        $displayName = trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')) ?: $shop;

        $user = DB::transaction(function () use ($data, $shop, $displayName) {
            $user = User::create([
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'name' => $displayName,
                'phone' => $data['phone'],
                'country' => $data['country'],
                'password' => Hash::make($data['password']),
                'role' => 'agent',
            ]);

            $agent = Agent::create([
                'user_id' => $user->id,
                'shop_name' => $shop,
            ]);

            Wallet::create([
                'agent_id' => $agent->id,
                'balance' => 0,
            ]);

            return $user;
        });

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user->load('agent.wallet')),
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $credentials['phone'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user->load('agent.wallet')),
        ]);
    }

    /**
     * Generate a one-time code, store it (5 min) and "send" it.
     * In local/test mode no real SMS is sent: the code is written to the logs
     * and returned as `dev_code` so it can be tested without an SMS provider.
     */
    public function sendOtp(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string',
            'mode'  => 'nullable|in:register,login',
        ]);

        $user = User::where('phone', $data['phone'])->first();

        // Inscription : le numéro ne doit pas déjà avoir un compte.
        if (($data['mode'] ?? null) === 'register' && $user) {
            throw ValidationException::withMessages([
                'phone' => ['Ce numéro a déjà un compte. Connectez-vous.'],
            ]);
        }

        $code = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        Cache::put('otp:' . $data['phone'], $code, now()->addMinutes(5));

        // TODO: plug a real SMS provider (Twilio, Orange SMS API) here for production.
        Log::info("[OTP] Code pour {$data['phone']} : {$code} (valide 5 min)");

        $response = [
            'message' => 'Code envoyé.',
            'expires_in' => 300,
        ];

        // Expose the code only in local/test so the flow is testable without SMS.
        if (app()->environment('local')) {
            $response['dev_code'] = $code;
        }

        return response()->json($response);
    }

    /**
     * Verify the one-time code and, on success, sign the agent in (issue a token).
     */
    /**
     * Vérifie le code OTP SANS connecter (inscription : le compte n'existe pas encore).
     * Marque le numéro comme vérifié pendant 20 min pour autoriser l'inscription.
     */
    public function checkOtp(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string',
            'code'  => 'required|string',
        ]);

        $cached = Cache::get('otp:' . $data['phone']);

        if (! $cached || ! hash_equals($cached, $data['code'])) {
            throw ValidationException::withMessages([
                'code' => ['Code incorrect ou expiré.'],
            ]);
        }

        Cache::forget('otp:' . $data['phone']);
        Cache::put('otp_ok:' . $data['phone'], true, now()->addMinutes(20));

        return response()->json(['ok' => true, 'message' => 'Numéro vérifié.']);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string',
        ]);

        $cached = Cache::get('otp:' . $data['phone']);

        if (! $cached || ! hash_equals($cached, $data['code'])) {
            throw ValidationException::withMessages([
                'code' => ['Code incorrect ou expiré.'],
            ]);
        }

        Cache::forget('otp:' . $data['phone']);

        $user = User::where('phone', $data['phone'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => ['Aucun compte n\'est associé à ce numéro.'],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user->load('agent.wallet')),
        ]);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user()->load('agent.wallet'));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}
