<?php

namespace App\Services;

use App\Exceptions\TransactionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayDunyaService
{
    private string $baseUrl;
    private string $masterKey;
    private string $privateKey;
    private string $token;

    public function __construct()
    {
        $this->baseUrl = config('services.paydunya.base_url', 'https://app.paydunya.com/api/v1');
        $this->masterKey = config('services.paydunya.master_key', '');
        $this->privateKey = config('services.paydunya.private_key', '');
        $this->token = config('services.paydunya.token', '');
    }

    /**
     * Effectuer un transfert vers un wallet client (Payout).
     *
     * @param string $phoneNumber
     * @param float $amount
     * @param string $reference
     * @return array
     * @throws TransactionException
     */
    public function triggerPayout(string $phoneNumber, float $amount, string $reference): array
    {
        Log::info("PayDunya Payout Initiated: {$reference} for {$amount} to {$phoneNumber}");

        // Simulation de l'appel API réel
        // En production, vous feriez un Http::post() vers l'endpoint Disburse de PayDunya
        $isSuccess = true; // Simulé

        if (!$isSuccess) {
            throw TransactionException::paydunyaError("Le paiement a été refusé par l'opérateur.");
        }

        return [
            'status' => 'success',
            'transaction_id' => 'PAYDUNYA-' . uniqid(),
            'message' => 'Payout successful',
        ];
    }

    /**
     * Envoyer une demande de paiement (Request To Pay) au client.
     *
     * @param string $phoneNumber
     * @param float $amount
     * @param string $reference
     * @return array
     * @throws TransactionException
     */
    public function requestToPay(string $phoneNumber, float $amount, string $reference): array
    {
        Log::info("PayDunya Request To Pay Initiated: {$reference} for {$amount} from {$phoneNumber}");

        // Simulation de l'appel API réel pour RTP
        $isSuccess = true; // Simulé

        if (!$isSuccess) {
            throw TransactionException::paydunyaError("La demande de paiement a échoué.");
        }

        return [
            'status' => 'success',
            'transaction_id' => 'PAYDUNYA-RTP-' . uniqid(),
            'message' => 'RTP sent successfully. Waiting for client confirmation.',
        ];
    }
}
