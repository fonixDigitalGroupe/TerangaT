<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // Supposons que seul un marchand authentifié peut faire cette requête.
        // auth()->user()->isMerchant() serait idéal ici.
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'operator'      => 'required|string|in:wave,om',
            'client_number' => ['required', 'string', 'regex:/^(77|78|76|70|75)[0-9]{7}$/'],
            'amount'        => 'required|numeric|min:100',
            'type'          => 'required|string|in:deposit,withdrawal',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'operator.in'         => 'L\'opérateur doit être Wave ou Orange Money.',
            'client_number.regex' => 'Le numéro du client est invalide. Il doit s\'agir d\'un numéro sénégalais valide.',
            'amount.min'          => 'Le montant de la transaction doit être d\'au moins 100 FCFA.',
            'type.in'             => 'Le type de transaction doit être deposit ou withdrawal.',
        ];
    }
}
