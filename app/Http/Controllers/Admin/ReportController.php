<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = Report::with(['user', 'reportable'])->orderByDesc('created_at');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $reports = $query->paginate(20)->through(function ($report) {
            $itemTitle = 'Unknown';
            $itemType = class_basename($report->reportable_type);

            if ($report->reportable) {
                if ($itemType === 'ExchangePost') {
                    $itemTitle = $report->reportable->offering ?? 'Unknown';
                } else {
                    $itemTitle = $report->reportable->title ?? 'Unknown';
                }
            }

            return [
                'id' => $report->id,
                'reason' => $report->reason,
                'description' => $report->description,
                'status' => $report->status,
                'created_at' => $report->created_at->diffForHumans(),
                'reporter' => [
                    'name' => $report->user ? $report->user->name : 'Unknown User',
                ],
                'item' => [
                    'type' => $itemType,
                    'title' => $itemTitle,
                ]
            ];
        });

        return response()->json($reports);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:resolved,dismissed'
        ]);

        $report = Report::findOrFail($id);
        $report->status = $request->status;
        $report->save();

        return response()->json(['message' => 'Report status updated successfully.']);
    }

    public function destroy($id): JsonResponse
    {
        $report = Report::findOrFail($id);
        $report->delete();

        return response()->json(['message' => 'Report deleted successfully.']);
    }
}
