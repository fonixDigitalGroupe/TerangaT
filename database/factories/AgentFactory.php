<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Agent>
 */
class AgentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shop_name' => fake()->company() . ' Money',
            'ninea' => fake()->numerify('#########'),
            'address' => fake()->address(),
            'wave_number' => '77' . fake()->numerify('#######'),
            'om_number' => '78' . fake()->numerify('#######'),
        ];
    }
}
