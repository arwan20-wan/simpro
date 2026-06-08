<?php

namespace App\Http\Controllers\Api\PJ;

use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FinancialTransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $transactions = FinancialTransaction::with('project')
            ->whereHas('project', function ($query) use ($user) {
                $query->where('pj_user_id', $user->id);
            })
            ->orderBy('transaction_date', 'desc')
            ->get();

        // precompute used amounts per project (only expenses)
        $usedByProject = FinancialTransaction::where('type', 'expense')
            ->whereHas('project', function ($query) use ($user) {
                $query->where('pj_user_id', $user->id);
            })
            ->groupBy('project_id')
            ->select('project_id', DB::raw('SUM(amount) as used'))
            ->pluck('used', 'project_id')
            ->toArray();

        $data = $transactions->map(function ($t) use ($usedByProject) {
            $project = $t->project;
            $budget = $project->budget ?? 0;
            $used = isset($usedByProject[$project->id]) ? (float)$usedByProject[$project->id] : 0.0;

            return [
                'id' => $t->id,
                'project' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'location' => $project->location,
                ],
                'transaction_date' => $t->transaction_date->toDateString(),
                'type' => $t->type,
                'category' => $t->category,
                'description' => $t->description,
                'amount' => (float)$t->amount,
                'receipt_url' => $t->receipt_path ? url(Storage::url($t->receipt_path)) : null,
                'status' => $this->computeStatus($used, $budget),
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function summary(Request $request)
    {
        $user = $request->user();

        $projectQuery = Project::where('pj_user_id', $user->id);

        $totalBudget = (clone $projectQuery)->sum('budget');
        $totalUsed = FinancialTransaction::where('type', 'expense')
            ->whereHas('project', function ($query) use ($user) {
                $query->where('pj_user_id', $user->id);
            })
            ->sum('amount');

        $projects = (clone $projectQuery)
            ->with('financialTransactions')
            ->get()
            ->map(function ($p) {
                $used = $p->financialTransactions()->where('type', 'expense')->sum('amount');
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'location' => $p->location,
                    'budget' => (float)$p->budget,
                    'used' => (float)$used,
                    'status' => $this->computeStatus($used, $p->budget),
                ];
            });

        return response()->json([
            'total_budget' => (float)$totalBudget,
            'total_used' => (float)$totalUsed,
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'transaction_date' => 'required|date',
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'receipt' => 'nullable|file|max:10240',
        ]);

        Project::query()
            ->where('id', $data['project_id'])
            ->where('pj_user_id', $request->user()->id)
            ->firstOrFail();

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        $transaction = FinancialTransaction::create([
            'project_id' => $data['project_id'],
            'recorded_by' => $request->user()->id,
            'transaction_date' => $data['transaction_date'],
            'type' => $data['type'],
            'category' => $data['category'],
            'description' => $data['description'] ?? null,
            'amount' => $data['amount'],
            'receipt_path' => $receiptPath,
        ]);

        return response()->json(['data' => $transaction], 201);
    }

    public function viewReceipt(FinancialTransaction $transaction)
    {
        abort_if($transaction->project?->pj_user_id !== request()->user()->id, 403);

        if (! $transaction->receipt_path || ! Storage::disk('public')->exists($transaction->receipt_path)) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        $path = Storage::disk('public')->path($transaction->receipt_path);
        return response()->file($path);
    }

    public function downloadReceipt(FinancialTransaction $transaction)
    {
        abort_if($transaction->project?->pj_user_id !== request()->user()->id, 403);

        if (! $transaction->receipt_path || ! Storage::disk('public')->exists($transaction->receipt_path)) {
            return response()->json(['message' => 'Receipt not found'], 404);
        }

        $path = Storage::disk('public')->path($transaction->receipt_path);
        return response()->download($path);
    }

    private function computeStatus($used, $budget)
    {
        $used = (float)$used;
        $budget = (float)$budget;

        if ($budget <= 0) {
            return 'tidak aman';
        }

        $ratio = $used / $budget;

        if ($ratio <= 0.7) {
            return 'aman';
        }

        if ($ratio <= 1.0) {
            return 'perhatian';
        }

        return 'tidak aman';
    }
}
