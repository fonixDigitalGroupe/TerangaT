<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service d'intégration PayDunya.
 *
 * Flux :
 *  - RETRAIT (client -> agent)  : createInvoice() puis softpayWave()/softpayOrangeMoney()  (encaissement)
 *  - DÉPÔT   (agent -> client)  : disburse()  (déboursement / PER)
 *
 * ⚠️ Toutes les clés viennent du .env (jamais en dur). Tester en mode 'test' d'abord.
 */
class PaydunyaService
{
    private function baseUrl(): string
    {
        $mode = config('paydunya.mode', 'test');

        return config("paydunya.base_url.$mode");
    }

    private function headers(): array
    {
        return [
            'Content-Type'        => 'application/json',
            'PAYDUNYA-MASTER-KEY' => config('paydunya.master_key'),
            'PAYDUNYA-PRIVATE-KEY'=> config('paydunya.private_key'),
            'PAYDUNYA-TOKEN'      => config('paydunya.token'),
        ];
    }

    /**
     * 1) Crée une facture de paiement et renvoie son token (nécessaire pour SOFTPAY).
     */
    public function createInvoice(int $amount, string $description, array $customData = []): array
    {
        $payload = [
            'invoice' => [
                'total_amount' => $amount,
                'description'  => $description,
            ],
            'store' => [
                'name'  => config('paydunya.store.name'),
                'phone' => config('paydunya.store.phone'),
            ],
            'actions' => [
                'cancel_url'   => config('paydunya.cancel_url'),
                'return_url'   => config('paydunya.return_url'),
                'callback_url' => config('paydunya.callback_url'),
            ],
            'custom_data' => $customData,
        ];

        $res = Http::withHeaders($this->headers())
            ->post($this->baseUrl() . '/checkout-invoice/create', $payload);

        $data = $res->json() ?? [];
        Log::info('[PayDunya] createInvoice', ['status' => $res->status(), 'response' => $data]);

        // response_code "00" = succès ; token à réutiliser pour SOFTPAY
        return [
            'ok'      => ($data['response_code'] ?? null) === '00',
            'token'   => $data['token'] ?? null,
            'url'     => $data['response_text'] ?? null,
            'raw'     => $data,
        ];
    }

    /**
     * 2a) RETRAIT via Wave Sénégal (SOFTPAY). Renvoie une URL Wave à ouvrir pour valider.
     */
    public function softpayWave(string $invoiceToken, string $fullName, string $phone, ?string $email = null): array
    {
        $res = Http::withHeaders($this->headers())
            ->post($this->baseUrl() . '/softpay/wave-senegal', [
                'wave_senegal_fullName'      => $fullName,
                'wave_senegal_email'         => $email ?? 'client@terangatrans.sn',
                'wave_senegal_phone'         => $phone,
                'wave_senegal_payment_token' => $invoiceToken,
            ]);

        $data = $res->json() ?? [];
        Log::info('[PayDunya] softpayWave', ['status' => $res->status(), 'response' => $data]);

        return [
            'ok'      => (bool) ($data['success'] ?? false),
            'url'     => $data['url'] ?? null,       // URL Wave à ouvrir
            'message' => $data['message'] ?? null,
            'raw'     => $data,
        ];
    }

    /**
     * 2b) RETRAIT via Orange Money Sénégal (SOFTPAY, avec code OTP client #144#391#).
     */
    public function softpayOrangeMoney(string $invoiceToken, string $customerName, string $phone, string $otpCode, ?string $email = null): array
    {
        $res = Http::withHeaders($this->headers())
            ->post($this->baseUrl() . '/softpay/orange-money-senegal', [
                'customer_name'      => $customerName,
                'customer_email'     => $email ?? 'client@terangatrans.sn',
                'phone_number'       => $phone,
                'authorization_code' => $otpCode,
                'invoice_token'      => $invoiceToken,
            ]);

        $data = $res->json() ?? [];
        Log::info('[PayDunya] softpayOrangeMoney', ['status' => $res->status(), 'response' => $data]);

        return [
            'ok'      => (bool) ($data['success'] ?? false),
            'message' => $data['message'] ?? null,
            'raw'     => $data,
        ];
    }

    /**
     * 3) DÉPÔT : déboursement (envoi d'argent vers un numéro Wave/OM).
     *    withdraw_mode : 'wave-senegal' | 'orange-money-senegal' | ...
     */
    public function disburse(string $phone, int $amount, string $withdrawMode): array
    {
        // Étape 1 : obtenir un token de déboursement
        $invoice = Http::withHeaders($this->headers())
            ->post($this->baseUrl() . '/disburse/get-invoice', [
                'account_alias' => $phone,
                'amount'        => $amount,
                'withdraw_mode' => $withdrawMode,
            ])->json() ?? [];

        if (($invoice['response_code'] ?? null) !== '00') {
            return ['ok' => false, 'step' => 'get-invoice', 'raw' => $invoice];
        }

        // Étape 2 : soumettre le déboursement
        $submit = Http::withHeaders($this->headers())
            ->post($this->baseUrl() . '/disburse/submit-invoice', [
                'disburse_invoice' => $invoice['disburse_token'] ?? null,
                'disburse_id'      => $phone,
            ])->json() ?? [];

        return [
            'ok'      => ($submit['response_code'] ?? null) === '00',
            'message' => $submit['response_text'] ?? null,
            'raw'     => $submit,
        ];
    }

    /**
     * Vérifie le statut d'une facture (après IPN ou retour).
     */
    public function confirmInvoice(string $invoiceToken): array
    {
        $res = Http::withHeaders($this->headers())
            ->get($this->baseUrl() . '/checkout-invoice/confirm/' . $invoiceToken);

        $data = $res->json() ?? [];

        return [
            'ok'     => ($data['response_code'] ?? null) === '00',
            'status' => $data['status'] ?? null,     // 'completed' | 'cancelled' | 'pending'
            'raw'    => $data,
        ];
    }
}
