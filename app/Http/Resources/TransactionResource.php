<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'type' => $this->type,
            'fee_strategy' => $this->fee_strategy,
            'amount' => (float) $this->amount,
            'commission' => (float) $this->commission,
            'total' => (float) $this->total,
            'client_phone' => $this->client_phone,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'commission_breakdown' => $this->whenLoaded('commission_breakdown', function () {
                return [
                    'agent_amount' => (float) $this->commission_breakdown->agent_amount,
                    'platform_amount' => (float) $this->commission_breakdown->platform_amount,
                ];
            }),
        ];
    }
}
