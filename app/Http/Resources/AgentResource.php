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
            'shop_name' => $this->shop_name,
            'ninea' => $this->ninea,
            'address' => $this->address,
            'wave_number' => $this->wave_number,
            'om_number' => $this->om_number,
            'wallet' => new WalletResource($this->whenLoaded('wallet')),
        ];
    }
}
