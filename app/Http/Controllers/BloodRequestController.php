<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BloodRequest;
use App\Models\BloodDonationResponse;
use Illuminate\Support\Facades\Auth;

class BloodRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = BloodRequest::with(['user.profile', 'responses.user.profile'])->latest();

        $requests = $query->get()->map(function ($item) use ($request) {
            $responses = $item->responses->map(function ($resp) {
                return [
                    'id' => $resp->user->id,
                    'name' => $resp->user->name,
                    'roll_number' => $resp->user->roll_number,
                    'phone' => $resp->user->phone ?? 'N/A',
                    'blood_group' => $resp->user->blood_group ?? 'Unknown',
                    'avatar' => $resp->user->profile->avatar ?? "https://ui-avatars.com/api/?name=" . urlencode($resp->user->name) . "&background=random",
                ];
            });

            return [
                'id' => $item->id,
                'blood_group' => $item->blood_group,
                'units' => $item->units,
                'hospital' => $item->hospital,
                'date_time' => $item->date_time,
                'contact' => $item->contact,
                'priority' => $item->priority,
                'notes' => $item->notes,
                'status' => $item->status,
                'postedAt' => $item->created_at->diffForHumans(),
                'selfPosted' => $item->user_id === $request->user()->id,
                'reporter' => $item->user->name,
                'responses' => $responses,
                'hasResponded' => $item->responses->contains('user_id', $request->user()->id),
            ];
        });

        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'blood_group' => 'required|string',
            'units' => 'required|integer|min:1',
            'hospital' => 'required|string',
            'date_time' => 'required|date',
            'contact' => 'required|string',
            'priority' => 'required|in:Standard,Emergency',
            'notes' => 'nullable|string',
        ]);

        $bloodRequest = $request->user()->bloodRequests()->create($validated);

        return response()->json(['message' => 'Blood request created successfully', 'id' => $bloodRequest->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $bloodRequest = BloodRequest::findOrFail($id);

        if ($bloodRequest->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'blood_group' => 'sometimes|string',
            'units' => 'sometimes|integer|min:1',
            'hospital' => 'sometimes|string',
            'date_time' => 'sometimes|date',
            'contact' => 'sometimes|string',
            'priority' => 'sometimes|in:Standard,Emergency',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:Active,Resolved',
        ]);

        $bloodRequest->update($validated);

        return response()->json(['message' => 'Blood request updated successfully']);
    }

    public function destroy(Request $request, string $id)
    {
        $bloodRequest = BloodRequest::findOrFail($id);

        if ($bloodRequest->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $bloodRequest->delete();

        return response()->json(['message' => 'Blood request deleted successfully']);
    }

    public function donate(Request $request, string $id)
    {
        $bloodRequest = BloodRequest::findOrFail($id);
        $user = $request->user();

        if ($bloodRequest->user_id === $user->id) {
            return response()->json(['message' => 'Cannot donate to your own request'], 400);
        }

        $existingResponse = BloodDonationResponse::where('blood_request_id', $bloodRequest->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingResponse) {
            $existingResponse->delete();
            return response()->json(['message' => 'Donation offer withdrawn']);
        } else {
            BloodDonationResponse::create([
                'blood_request_id' => $bloodRequest->id,
                'user_id' => $user->id,
            ]);
            return response()->json(['message' => 'Donation offer sent']);
        }
    }
}
