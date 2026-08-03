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
            $itemUrl = null;
            $itemAuthor = null;
            $itemExists = false;
            $itemId = $report->reportable_id;

            if ($report->reportable) {
                $itemExists = true;
                $target = $report->reportable;

                if (isset($target->user) && $target->user) {
                    $itemAuthor = $target->user->name;
                }

                switch ($itemType) {
                    case 'MarketplaceListing':
                        $itemTitle = $target->title ?? ('Listing #' . $target->id);
                        $itemUrl = '/app/marketplace?open=' . $target->id;
                        break;
                    case 'ExchangePost':
                        $itemTitle = ($target->offering ? $target->offering . ' ↔ ' . $target->desire : 'Exchange #' . $target->id);
                        $itemUrl = '/app/exchange?open=' . $target->id;
                        break;
                    case 'Resource':
                        $itemTitle = $target->title ?? ('Resource #' . $target->id);
                        $itemUrl = '/app/resources?open=' . $target->id;
                        break;
                    case 'RoommatePost':
                        $itemTitle = $target->title ?? ('Roommate Post #' . $target->id);
                        $itemUrl = '/app/roommates?open=' . $target->id;
                        break;
                    case 'LostAndFoundItem':
                        $itemTitle = $target->title ?? ('Lost & Found #' . $target->id);
                        $itemUrl = '/app/lost-found?open=' . $target->id;
                        break;
                    case 'BloodRequest':
                        $itemTitle = ($target->blood_group ? $target->blood_group . ' blood at ' . $target->hospital : 'Blood Request #' . $target->id);
                        $itemUrl = '/app/blood?open=' . $target->id;
                        break;
                    case 'User':
                        $itemTitle = $target->name ?? 'User Profile';
                        $itemUrl = '/app/profile/' . ($target->roll_number ?? $target->id);
                        break;
                    default:
                        $itemTitle = $target->title ?? $target->name ?? ('Item #' . $target->id);
                        break;
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
                    'id' => $itemId,
                    'type' => $itemType,
                    'title' => $itemTitle,
                    'url' => $itemUrl,
                    'author' => $itemAuthor,
                    'exists' => $itemExists,
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

    public function removeItem($id): JsonResponse
    {
        $report = Report::findOrFail($id);

        if ($report->reportable) {
            $report->reportable->delete();
        }

        $report->status = 'resolved';
        $report->save();

        return response()->json([
            'message' => 'Reported content has been permanently removed and report marked as resolved.'
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $report = Report::findOrFail($id);
        $report->delete();

        return response()->json(['message' => 'Report deleted successfully.']);
    }
}

