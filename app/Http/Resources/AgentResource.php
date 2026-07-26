<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'shop_name' => $this->shop_name,
            'shop_number' => $this->shop_number,
            'cni_number' => $this->cni_number,
            'ninea' => $this->ninea,
            'address' => $this->address,
            'wave_number' => $this->wave_number,
            'om_number' => $this->om_number,
            'status' => $this->status,
            'kyc' => [
                'submitted'  => (bool) $this->kyc_submitted_at,
                'cni_recto'  => $this->cni_recto_path ? asset('storage/' . $this->cni_recto_path) : null,
                'cni_verso'  => $this->cni_verso_path ? asset('storage/' . $this->cni_verso_path) : null,
                'selfie'     => $this->selfie_path ? asset('storage/' . $this->selfie_path) : null,
            ],
            'wallet' => new WalletResource($this->whenLoaded('wallet')),
        ];
    }
}
