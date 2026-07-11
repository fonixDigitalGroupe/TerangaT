<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Operator;
use App\Models\Transaction;
use App\Services\PaydunyaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private PaydunyaService $paydunya)
    {
    }

    /** Correspondance opérateur app -> PayDunya + nom en base */
    private const OPERATORS = [
        'wave'         => ['mode' => 'wave-senegal',         'name' => 'Wave'],
        'orange-money' => ['mode' => 'orange-money-senegal', 'name' => 'Orange Money'],
    ];

    /**
     * RETRAIT : le client envoie de l'argent vers l'agent (encaissement / SOFTPAY).
     * Body: operator (wave|orange-money), amount, client_phone, [otp] (requis pour OM)
     */
    public function retrait(Request $request)
    {
        $data = $request->validate([
            'operator'     => 'required|in:wave,orange-money',
            'amount'       => 'required|integer|min:100',
            'client_phone' => 'required|string|max:20',
            'otp'          => 'required_if:operator,orange-money|string|nullable',
        ]);

        $agent = $request->user()->agent;
        $tx = $this->createTransaction($agent->id, 'retrait', $data);

        // 1) Facture PayDunya
        $invoice = $this->paydunya->createInvoice(
            $data['amount'],
            "Retrait Téranga — {$data['client_phone']}",
            ['transaction_id' => $tx->id, 'agent_id' => $agent->id]
        );

        if (! $invoice['ok'] || ! $invoice['token']) {
            $tx->update(['status' => 'échoué']);
            return response()->json(['message' => 'Échec de création du paiement.', 'details' => $invoice['raw']], 422);
        }

        $tx->update(['paydunya_token' => $invoice['token']]);

        // 2) SOFTPAY selon l'opérateur
        if ($data['operator'] === 'wave') {
            $pay = $this->paydunya->softpayWave($invoice['token'], $agent->user->name ?? 'Client', $data['client_phone']);
            if (! $pay['ok']) {
                $tx->update(['status' => 'échoué']);
                return response()->json(['message' => $pay['message'] ?? 'Échec Wave.', 'details' => $pay['raw']], 422);
            }
            return response()->json([
                'message'    => 'Ouvrez Wave pour valider le paiement.',
                'reference'  => $tx->reference,
                'pay_url'    => $pay['url'],   // l'app ouvre cette URL Wave
                'status'     => 'en attente',
            ]);
        }

        // Orange Money (avec OTP client)
        $pay = $this->paydunya->softpayOrangeMoney($invoice['token'], $agent->user->name ?? 'Client', $data['client_phone'], $data['otp']);
        if (! $pay['ok']) {
            $tx->update(['status' => 'échoué']);
            return response()->json(['message' => $pay['message'] ?? 'Échec Orange Money.', 'details' => $pay['raw']], 422);
        }

        return response()->json([
            'message'   => 'Paiement Orange Money initié.',
            'reference' => $tx->reference,
            'status'    => 'en attente',
        ]);
    }

    /**
     * DÉPÔT : l'agent envoie de l'argent vers le client (déboursement / PER).
     * Body: operator (wave|orange-money), amount, client_phone
     */
    public function depot(Request $request)
    {
        $data = $request->validate([
            'operator'     => 'required|in:wave,orange-money',
            'amount'       => 'required|integer|min:100',
            'client_phone' => 'required|string|max:20',
        ]);

        $agent = $request->user()->agent;
        $tx = $this->createTransaction($agent->id, 'dépôt', $data);

        $mode = self::OPERATORS[$data['operator']]['mode'];
        $res = $this->paydunya->disburse($data['client_phone'], $data['amount'], $mode);

        $tx->update(['status' => $res['ok'] ? 'completed' : 'échoué']);

        return response()->json([
            'message'   => $res['ok'] ? 'Dépôt effectué avec succès.' : ($res['message'] ?? 'Échec du dépôt.'),
            'reference' => $tx->reference,
            'status'    => $tx->status,
            'details'   => $res['raw'] ?? null,
        ], $res['ok'] ? 200 : 422);
    }

    /**
     * IPN : PayDunya notifie le serveur du statut final d'un paiement.
     * Route publique (pas d'auth) — PayDunya l'appelle.
     */
    public function ipn(Request $request)
    {
        // PayDunya renvoie le token de la facture dans data[invoice][token]
        $token = data_get($request->all(), 'data.invoice.token')
            ?? $request->input('token')
            ?? data_get($request->all(), 'invoice.token');

        if (! $token) {
            return response()->json(['message' => 'Token manquant.'], 400);
        }

        $tx = Transaction::where('paydunya_token', $token)->first();
        if (! $tx) {
            return response()->json(['message' => 'Transaction inconnue.'], 404);
        }

        $check = $this->paydunya->confirmInvoice($token);
        if ($check['ok']) {
            $status = $check['status'] === 'completed' ? 'completed'
                : ($check['status'] === 'cancelled' ? 'échoué' : 'en attente');
            $tx->update(['status' => $status]);
        }

        return response()->json(['message' => 'IPN traité.']);
    }

    /**
     * Crée la transaction (statut initial « en attente ») + la commission associée.
     */
    private function createTransaction(int $agentId, string $type, array $data): Transaction
    {
        $opName = self::OPERATORS[$data['operator']]['name'];
        $feePercent = (float) (Operator::where('name', $opName)->value('fee_percent') ?? 1.0);
        $commission = (int) round($data['amount'] * $feePercent / 100);

        $tx = Transaction::create([
            'agent_id'     => $agentId,
            'type'         => $type,
            'operator'     => $data['operator'],
            'fee_strategy' => 'deducted',
            'amount'       => $data['amount'],
            'commission'   => $commission,
            'total'        => $data['amount'] + $commission,
            'client_phone' => $data['client_phone'],
            'status'       => 'en attente',
            'reference'    => 'TRX-' . strtoupper(Str::random(11)),
        ]);

        $agentPart = (int) round($commission * 0.4);
        Commission::create([
            'transaction_id'  => $tx->id,
            'agent_amount'    => $agentPart,
            'platform_amount' => $commission - $agentPart,
        ]);

        return $tx;
    }
}
