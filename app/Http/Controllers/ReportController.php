<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // Store a newly created report in storage.
    public function store(Request $request)
    {
        $request->validate([
            'reportable_type' => 'required|string',
            'reportable_id' => 'required',
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $report = new Report();
        $report->user_id = $request->user()->id;
        $report->reportable_type = $request->reportable_type;
        $report->reportable_id = $request->reportable_id;
        $report->reason = $request->reason;
        $report->description = $request->description;
        $report->status = 'open';
        $report->save();

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report' => $report,
        ], 201);
    }
}
