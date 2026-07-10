<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'country' => $this->country,
            'address' => $this->address,
            'role' => $this->role,
            'agent' => new AgentResource($this->whenLoaded('agent')),
        ];
    }
}
