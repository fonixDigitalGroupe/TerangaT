<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_agents'       => Agent::count(),
            'total_transactions' => Transaction::count(),
            'total_volume'       => Transaction::sum('amount'),
            'total_commission'   => Transaction::sum('commission'),
        ];

        $recentTransactions = Transaction::with('agent.user')
            ->latest()
            ->take(8)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentTransactions'));
    }

    public function agents(Request $request)
    {
        $perPage = (int) $request->input('perPage', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25;

        $region = $request->input('region');
        $status = $request->input('status');

        $agents = Agent::with(['user'])
            ->withCount('transactions')
            ->when($region, function ($query) use ($region) {
                $query->whereHas('user', fn ($q) => $q->where('country', $region));
            })
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $regions = User::whereHas('agent')
            ->whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return view('admin.agents', compact('agents', 'perPage', 'regions', 'region', 'status'));
    }

    public function showAgent(Agent $agent)
    {
        $agent->load(['user']);
        $agent->loadCount('transactions');
        $recentTransactions = $agent->transactions()->latest()->take(10)->get();

        return view('admin.agent-detail', compact('agent', 'recentTransactions'));
    }

    public function editAgent(Agent $agent)
    {
        $agent->load(['user', 'wallet']);

        return view('admin.agent-edit', compact('agent'));
    }

    public function updateAgent(Request $request, Agent $agent)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'phone'      => 'required|string|max:20|unique:users,phone,' . $agent->user_id,
            'shop_name'  => 'nullable|string|max:255',
        ]);

        $agent->user->update([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'name'       => $data['first_name'] . ' ' . $data['last_name'],
            'phone'      => $data['phone'],
        ]);

        $agent->update(['shop_name' => $data['shop_name'] ?? $agent->shop_name]);

        return redirect()->route('admin.agents')->with('success', 'Agent mis à jour avec succès.');
    }

    public function destroyAgent(Agent $agent)
    {
        // La suppression de l'utilisateur cascade vers l'agent, le wallet et les transactions.
        $agent->user?->delete();
        $agent->delete();

        return redirect()->route('admin.agents')->with('success', 'Agent supprimé avec succès.');
    }

    public function commissions(Request $request)
    {
        $perPage = (int) $request->input('perPage', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25;

        $commissions = \App\Models\Commission::with('transaction.agent.user')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $totalPlatform = \App\Models\Commission::sum('platform_amount');
        $totalAgent    = \App\Models\Commission::sum('agent_amount');

        return view('admin.commissions', compact('commissions', 'perPage', 'totalPlatform', 'totalAgent'));
    }

    public function operateurs()
    {
        $operators = \App\Models\Operator::orderBy('name')->get();

        return view('admin.operateurs', compact('operators'));
    }

    public function createOperator()
    {
        return view('admin.operator-form', ['operator' => new \App\Models\Operator()]);
    }

    public function storeOperator(Request $request)
    {
        $data = $this->validateOperator($request);
        \App\Models\Operator::create($data);

        return redirect()->route('admin.operateurs')->with('success', 'Opérateur ajouté avec succès.');
    }

    public function editOperator(\App\Models\Operator $operator)
    {
        return view('admin.operator-form', compact('operator'));
    }

    public function updateOperator(Request $request, \App\Models\Operator $operator)
    {
        $operator->update($this->validateOperator($request));

        return redirect()->route('admin.operateurs')->with('success', 'Opérateur mis à jour avec succès.');
    }

    public function destroyOperator(\App\Models\Operator $operator)
    {
        $operator->delete();

        return redirect()->route('admin.operateurs')->with('success', 'Opérateur supprimé avec succès.');
    }

    private function validateOperator(Request $request): array
    {
        return $request->validate([
            'name'        => 'required|string|max:255',
            'logo'        => 'nullable|string|max:255',
            'fee_percent' => 'required|numeric|min:0|max:100',
            'status'      => 'required|in:actif,inactif',
        ]);
    }

    public function rapports()
    {
        return view('admin.rapports');
    }

    public function notifications()
    {
        $notifications = \App\Models\AdminNotification::latest()->paginate(10);
        $counts = [
            'tous'       => Agent::count(),
            'verifie'    => Agent::where('status', 'vérifié')->count(),
            'en_attente' => Agent::where('status', 'en attente')->count(),
        ];

        return view('admin.notifications', compact('notifications', 'counts'));
    }

    public function storeNotification(Request $request)
    {
        $data = $request->validate([
            'title'    => 'required|string|max:255',
            'message'  => 'required|string',
            'audience' => 'required|in:tous,verifie,en_attente',
        ]);

        $recipients = match ($data['audience']) {
            'verifie'    => Agent::where('status', 'vérifié')->count(),
            'en_attente' => Agent::where('status', 'en attente')->count(),
            default      => Agent::count(),
        };

        \App\Models\AdminNotification::create($data + ['recipients' => $recipients]);

        return redirect()->route('admin.notifications')->with('success', "Notification envoyée à {$recipients} agent(s).");
    }

    public function destroyNotification(\App\Models\AdminNotification $notification)
    {
        $notification->delete();

        return redirect()->route('admin.notifications')->with('success', 'Notification supprimée.');
    }

    public function exportRapport(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:transactions,agents,commissions',
            'from' => 'nullable|date',
            'to'   => 'nullable|date',
        ]);

        $type = $data['type'];
        $from = $data['from'] ?? null;
        $to   = $data['to'] ?? null;
        $stamp = now()->format('Ymd_His');
        $filename = "rapport_{$type}_{$stamp}.csv";

        [$headers, $rows] = match ($type) {
            'transactions' => $this->reportTransactions($from, $to),
            'agents'       => $this->reportAgents($from, $to),
            'commissions'  => $this->reportCommissions($from, $to),
        };

        return response()->streamDownload(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            fprintf($out, "\xEF\xBB\xBF"); // BOM UTF-8 pour Excel
            fputcsv($out, $headers, ';');
            foreach ($rows as $row) {
                fputcsv($out, $row, ';');
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function reportTransactions($from, $to): array
    {
        $items = \App\Models\Transaction::with('agent.user')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()->get();

        $rows = $items->map(fn ($t) => [
            $t->reference,
            $t->agent->user->name ?? '',
            $t->type,
            $t->amount,
            $t->commission,
            $t->status,
            $t->created_at?->format('d/m/Y H:i'),
        ])->all();

        return [['Référence', 'Agent', 'Type', 'Montant', 'Commission', 'Statut', 'Date'], $rows];
    }

    private function reportAgents($from, $to): array
    {
        $items = Agent::with('user')->withCount('transactions')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()->get();

        $rows = $items->map(fn ($a) => [
            $a->code,
            $a->user->name ?? '',
            $a->user->phone ?? '',
            $a->shop_name,
            $a->user->country ?? '',
            $a->status,
            $a->transactions_count,
        ])->all();

        return [['Code', 'Agent', 'Téléphone', 'Boutique', 'Région', 'Statut', 'Transactions'], $rows];
    }

    private function reportCommissions($from, $to): array
    {
        $items = \App\Models\Commission::with('transaction.agent.user')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()->get();

        $rows = $items->map(fn ($c) => [
            $c->transaction->reference ?? '',
            $c->transaction->agent->user->name ?? '',
            $c->agent_amount,
            $c->platform_amount,
            $c->created_at?->format('d/m/Y H:i'),
        ])->all();

        return [['Référence', 'Agent', 'Part agent', 'Part plateforme', 'Date'], $rows];
    }

    public function litiges(Request $request)
    {
        $status = $request->input('status');

        $disputes = \App\Models\Dispute::with('agent.user')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $counts = [
            'ouvert'   => \App\Models\Dispute::where('status', 'ouvert')->count(),
            'en_cours' => \App\Models\Dispute::where('status', 'en cours')->count(),
            'resolu'   => \App\Models\Dispute::where('status', 'résolu')->count(),
        ];

        return view('admin.litiges', compact('disputes', 'counts', 'status'));
    }

    public function createLitige()
    {
        $agents = Agent::with('user')->get();

        return view('admin.litige-form', compact('agents'));
    }

    public function storeLitige(Request $request)
    {
        $data = $request->validate([
            'agent_id'              => 'nullable|exists:agents,id',
            'transaction_reference' => 'nullable|string|max:255',
            'subject'               => 'required|string|max:255',
            'description'           => 'nullable|string',
        ]);

        \App\Models\Dispute::create($data);

        return redirect()->route('admin.litiges')->with('success', 'Litige enregistré avec succès.');
    }

    public function updateLitigeStatus(Request $request, \App\Models\Dispute $dispute)
    {
        $data = $request->validate([
            'status' => 'required|in:ouvert,en cours,résolu',
        ]);

        $dispute->update($data);

        return redirect()->route('admin.litiges')->with('success', 'Statut du litige mis à jour.');
    }

    public function destroyLitige(\App\Models\Dispute $dispute)
    {
        $dispute->delete();

        return redirect()->route('admin.litiges')->with('success', 'Litige supprimé.');
    }

    public function cartographie()
    {
        $byRegion = User::whereHas('agent')
            ->selectRaw('COALESCE(country, "Non renseignée") as region, COUNT(*) as total')
            ->groupBy('region')
            ->orderByDesc('total')
            ->get();

        $totalAgents = (int) $byRegion->sum('total');
        $maxRegion   = (int) ($byRegion->max('total') ?? 0);

        return view('admin.cartographie', compact('byRegion', 'totalAgents', 'maxRegion'));
    }

    public function statistiques(Request $request)
    {
        $from = $request->input('from') ?: now()->startOfMonth()->toDateString();
        $to   = $request->input('to') ?: now()->endOfMonth()->toDateString();

        // Base filtrée par période (sur created_at)
        $base = function () use ($from, $to) {
            return \App\Models\Transaction::query()
                ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
                ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to));
        };

        $kpis = [
            'transactions' => $base()->count(),
            'volume'       => $base()->sum('amount'),
            'commission'   => $base()->sum('commission'),
            'agents'       => Agent::query()
                ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
                ->when($to,   fn ($q) => $q->whereDate('created_at', '<=', $to))
                ->count(),
        ];

        // SQL compatible SQLite (local) ET MySQL (production)
        $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();
        $yearSql  = $driver === 'sqlite' ? "strftime('%Y', created_at)" : "DATE_FORMAT(created_at, '%Y')";
        $monthSql = $driver === 'sqlite' ? "strftime('%m', created_at)" : "DATE_FORMAT(created_at, '%m')";

        $year = (int) $request->input('year', now()->year);
        $years = \App\Models\Transaction::selectRaw("$yearSql as y")
            ->whereNotNull('created_at')->distinct()->orderByDesc('y')->pluck('y')
            ->map(fn ($y) => (int) $y);
        if (! $years->contains($year)) {
            $years = $years->push($year)->unique()->sortDesc()->values();
        }

        $monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        // Volume par mois (année sélectionnée + période Du/Au)
        $monthRows = $base()->selectRaw("$monthSql as m, SUM(amount) as v")
            ->whereRaw("$yearSql = ?", [(string) $year])
            ->groupBy('m')->get()->keyBy('m');
        $monthlyData = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlyData[] = (float) ($monthRows[sprintf('%02d', $i)]->v ?? 0);
        }

        // Helper : datasets mensuels empilés par dimension (type / statut), filtrés par période
        $buildMonthlyDatasets = function (string $column) use ($year, $base, $yearSql, $monthSql) {
            $rows = $base()->selectRaw("$monthSql as m, COALESCE($column, '—') as k, COUNT(*) as c")
                ->whereRaw("$yearSql = ?", [(string) $year])
                ->groupBy('m', 'k')->get();

            $keys = $rows->pluck('k')->unique()->values();
            $datasets = [];
            foreach ($keys as $key) {
                $data = array_fill(1, 12, 0);
                foreach ($rows->where('k', $key) as $row) {
                    $data[(int) $row->m] = (int) $row->c;
                }
                $datasets[] = ['label' => $key, 'data' => array_values($data)];
            }
            return $datasets;
        };

        $typeDatasets   = $buildMonthlyDatasets('type');
        $statusDatasets = $buildMonthlyDatasets('status');

        $topAgents = $base()->selectRaw('agent_id, COUNT(*) as c, SUM(amount) as v')
            ->with('agent.user')
            ->groupBy('agent_id')->orderByDesc('v')->limit(5)->get();

        return view('admin.statistiques', compact('kpis', 'typeDatasets', 'statusDatasets', 'monthLabels', 'monthlyData', 'year', 'years', 'topAgents', 'from', 'to'));
    }

    public function compte()
    {
        return view('admin.placeholder', [
            'pageTitle' => 'Compte',
            'desc'      => 'Gérez les informations de votre compte administrateur.',
        ]);
    }

    public function parametres()
    {
        return view('admin.placeholder', [
            'pageTitle' => 'Paramètres',
            'desc'      => 'Configuration générale de l\'application.',
        ]);
    }

    public function transactions(Request $request)
    {
        $perPage = (int) $request->input('perPage', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25;

        $transactions = Transaction::with('agent.user')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return view('admin.transactions', compact('transactions', 'perPage'));
    }
}
