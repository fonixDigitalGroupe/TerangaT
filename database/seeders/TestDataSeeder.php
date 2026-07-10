<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Commission;
use App\Models\Dispute;
use App\Models\AdminNotification;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $regions = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Sénégal', 'Mali', 'Côte d\'Ivoire', 'Guinée', 'Burkina Faso'];
        $firstNames = ['Amadou', 'Fatou', 'Ousmane', 'Awa', 'Modou', 'Aïssatou', 'Cheikh', 'Mariama', 'Ibrahima', 'Ndeye', 'Moussa', 'Khady', 'Serigne', 'Bineta', 'Lamine', 'Coumba', 'Pape', 'Sokhna'];
        $lastNames = ['Diop', 'Ndiaye', 'Fall', 'Sow', 'Ba', 'Diallo', 'Gueye', 'Sarr', 'Faye', 'Cissé', 'Sy', 'Kane', 'Mbaye', 'Sène', 'Thiam', 'Camara'];
        $shops = ['Boutique Centrale', 'Point Service', 'Kiosque Express', 'Multi-Services', 'Boutique du Marché', 'Espace Transfert', 'Agence Rapide', 'Comptoir Téranga'];
        $subjects = ['Montant non reçu', 'Erreur de destinataire', 'Transaction en double', 'Retrait contesté', 'Frais incorrects', 'Compte bloqué'];

        // Compte administrateur (idempotent)
        User::firstOrCreate(
            ['email' => 'admin@terangatrans.com'],
            [
                'name'       => 'Administrateur',
                'first_name' => 'Admin',
                'last_name'  => 'Téranga',
                'role'       => 'admin',
                'password'   => Hash::make('Admin@2026'),
            ]
        );

        $feeStrategies = ['client_pays', 'deducted', 'agent_receives'];

        // Nettoyage idempotent : retire les données de simulation précédentes (garde les 3 agents d'origine)
        $originalPhones = ['770000000', '7789866888', '775961959'];
        Agent::whereHas('user', fn ($q) => $q->whereNotIn('phone', $originalPhones))->get()->each(function ($a) {
            $u = $a->user;
            Transaction::where('agent_id', $a->id)->pluck('id')->each(fn ($id) => Commission::where('transaction_id', $id)->delete());
            $a->delete();
            $u?->delete();
        });
        Dispute::where('description', 'Litige signalé automatiquement lors de la simulation de données.')->delete();
        AdminNotification::whereIn('title', ['Maintenance planifiée', 'Nouvelle grille de commissions', 'Vérification de compte', 'Promotion du mois'])->delete();

        $start = Carbon::create(2025, 1, 1);
        $end = Carbon::now();

        $usedPhones = User::pluck('phone')->filter()->flip()->toArray();
        $prefixes = ['77', '78', '76', '70', '75'];

        $makePhone = function () use (&$usedPhones, $prefixes) {
            do {
                $phone = $prefixes[array_rand($prefixes)] . str_pad((string) random_int(0, 9999999), 7, '0', STR_PAD_LEFT);
            } while (isset($usedPhones[$phone]));
            $usedPhones[$phone] = true;
            return $phone;
        };

        $randomDate = function () use ($start, $end) {
            return Carbon::createFromTimestamp(random_int($start->timestamp, $end->timestamp));
        };

        $totalAgents = 15;
        $credentials = [];
        $allTransactions = [];

        for ($i = 0; $i < $totalAgents; $i++) {
            $first = $firstNames[array_rand($firstNames)];
            $last = $lastNames[array_rand($lastNames)];
            $phone = $makePhone();
            $pin = $i < 10 ? '1234' : str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            $region = $regions[array_rand($regions)];
            $createdAt = $randomDate();

            $user = new User([
                'first_name' => $first,
                'last_name'  => $last,
                'name'       => "$first $last",
                'phone'      => $phone,
                'country'    => $region,
                'role'       => 'agent',
            ]);
            $user->password = Hash::make($pin);
            $user->created_at = $createdAt;
            $user->updated_at = $createdAt;
            $user->timestamps = false;
            $user->save();

            $agent = new Agent([
                'user_id'   => $user->id,
                'shop_name' => $shops[array_rand($shops)],
                'status'    => random_int(1, 4) === 1 ? 'en attente' : 'vérifié',
            ]);
            $agent->code = Agent::generateUniqueCode();
            $agent->created_at = $createdAt;
            $agent->updated_at = $createdAt;
            $agent->timestamps = false;
            $agent->save();

            Wallet::create([
                'agent_id' => $agent->id,
                'balance'  => random_int(0, 1000) * 500,
                'currency' => 'XOF',
            ]);

            // Transactions de l'agent
            $nbTx = random_int(8, 25);
            for ($t = 0; $t < $nbTx; $t++) {
                $type = ['dépôt', 'retrait'][random_int(0, 1)];
                $amount = random_int(10, 400) * 500; // 5 000 -> 200 000
                $commission = (int) round($amount * 0.015);
                $rand = random_int(1, 10);
                $status = $rand <= 8 ? 'completed' : ($rand === 9 ? 'en attente' : 'échoué');
                $date = $randomDate();

                $tx = new Transaction([
                    'agent_id'     => $agent->id,
                    'type'         => $type,
                    'fee_strategy' => $feeStrategies[array_rand($feeStrategies)],
                    'amount'       => $amount,
                    'commission'   => $commission,
                    'total'        => $amount + $commission,
                    'client_phone' => $prefixes[array_rand($prefixes)] . str_pad((string) random_int(0, 9999999), 7, '0', STR_PAD_LEFT),
                    'status'       => $status,
                    'reference'    => 'TRX-' . strtoupper(Str::random(11)),
                ]);
                $tx->created_at = $date;
                $tx->updated_at = $date;
                $tx->timestamps = false;
                $tx->save();

                $agentPart = (int) round($commission * 0.4);
                $comm = new Commission([
                    'transaction_id'  => $tx->id,
                    'agent_amount'    => $agentPart,
                    'platform_amount' => $commission - $agentPart,
                ]);
                $comm->created_at = $date;
                $comm->updated_at = $date;
                $comm->timestamps = false;
                $comm->save();

                $allTransactions[] = ['agent_id' => $agent->id, 'ref' => $tx->reference];
            }

            if ($i < 10) {
                $credentials[] = ['name' => $user->name, 'phone' => $phone, 'pin' => $pin, 'region' => $region];
            }
        }

        // Litiges
        $agentIds = Agent::pluck('id')->all();
        for ($d = 0; $d < 8; $d++) {
            $pick = $allTransactions[array_rand($allTransactions)];
            $date = $randomDate();
            $st = ['ouvert', 'en cours', 'résolu'][random_int(0, 2)];
            $dispute = new Dispute([
                'agent_id'              => $pick['agent_id'],
                'transaction_reference' => $pick['ref'],
                'subject'               => $subjects[array_rand($subjects)],
                'description'           => 'Litige signalé automatiquement lors de la simulation de données.',
                'status'                => $st,
            ]);
            $dispute->code = 'LT-' . strtoupper(Str::random(6));
            $dispute->created_at = $date;
            $dispute->updated_at = $date;
            $dispute->timestamps = false;
            $dispute->save();
        }

        // Notifications
        $notifs = [
            ['Maintenance planifiée', 'Le service sera indisponible dimanche de 2h à 4h du matin.', 'tous'],
            ['Nouvelle grille de commissions', 'Les taux de commission ont été mis à jour. Consultez votre espace.', 'verifie'],
            ['Vérification de compte', 'Merci de compléter votre dossier pour activer votre compte.', 'en_attente'],
            ['Promotion du mois', 'Bonus de fidélité pour les agents les plus actifs.', 'tous'],
        ];
        foreach ($notifs as [$title, $message, $audience]) {
            $recipients = match ($audience) {
                'verifie'    => Agent::where('status', 'vérifié')->count(),
                'en_attente' => Agent::where('status', 'en attente')->count(),
                default      => Agent::count(),
            };
            $date = $randomDate();
            $n = new AdminNotification(compact('title', 'message', 'audience') + ['recipients' => $recipients]);
            $n->created_at = $date;
            $n->updated_at = $date;
            $n->timestamps = false;
            $n->save();
        }

        // Affiche les identifiants des 10 agents
        $this->command->info('=== 10 comptes agents (mobile) — PIN à 4 chiffres ===');
        foreach ($credentials as $c) {
            $this->command->info(sprintf('%-22s | %s | PIN: %s | %s', $c['name'], $c['phone'], $c['pin'], $c['region']));
        }
    }
}
