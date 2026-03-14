<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['retrait', 'dépôt']);
        $amount = fake()->numberBetween(1000, 50000);
        $commission = $amount * 0.03; // Simple 3% for test
        
        return [
            'type' => $type,
            'amount' => $amount,
            'commission' => $commission,
            'total' => $type === 'retrait' ? $amount + $commission : $amount - $amount, // Simplified
            'client_phone' => '70' . fake()->numerify('#######'),
            'status' => 'completed',
            'reference' => 'TRX-' . strtoupper(fake()->bothify('??#?#???')),
        ];
    }
}
