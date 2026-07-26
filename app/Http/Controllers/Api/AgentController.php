<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AgentController extends Controller
{
    /**
     * Soumission des pièces KYC : numéro de boutique + CNI recto/verso + selfie.
     * Multipart (form-data). Repasse le statut de l'agent en « en attente ».
     */
    public function uploadKyc(Request $request)
    {
        $agent = $request->user()->agent;
        if (! $agent) {
            return response()->json(['message' => 'Compte agent introuvable.'], 422);
        }

        $request->validate([
            'shop_number' => 'nullable|string|max:30',
            'cni_number'  => 'nullable|string|max:30',
            'cni_recto'   => 'nullable|image|max:8192',
            'cni_verso'   => 'nullable|image|max:8192',
            'selfie'      => 'nullable|image|max:8192',
        ]);

        $update = [];

        if ($request->filled('shop_number')) {
            $update['shop_number'] = $request->input('shop_number');
        }
        if ($request->filled('cni_number')) {
            $update['cni_number'] = $request->input('cni_number');
        }

        // Champ formulaire => colonne
        $files = ['cni_recto' => 'cni_recto_path', 'cni_verso' => 'cni_verso_path', 'selfie' => 'selfie_path'];
        foreach ($files as $field => $column) {
            if ($request->hasFile($field)) {
                // remplace l'ancien fichier s'il existe
                if ($agent->{$column}) {
                    Storage::disk('public')->delete($agent->{$column});
                }
                $update[$column] = $request->file($field)->store("kyc/{$agent->id}", 'public');
            }
        }

        if (! empty($update)) {
            $update['kyc_submitted_at'] = now();
            $update['status'] = 'en attente';
            $agent->update($update);
        }

        return response()->json([
            'message' => 'Documents envoyés. En attente de vérification.',
            'agent'   => new AgentResource($agent->fresh()),
        ]);
    }
}
