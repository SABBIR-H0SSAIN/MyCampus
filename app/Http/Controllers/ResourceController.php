<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Resource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResourceController extends Controller
{
    public function index(Request $request)
    {
        $query = Resource::with('user.profile')->latest();

        if ($request->has('department') && $request->department !== 'All departments') {
            $query->where('department', $request->department);
        }

        if ($request->has('semester') && $request->semester !== 'All semesters') {
            $query->where('semester', $request->semester);
        }

        if ($request->has('resource_type') && $request->resource_type !== 'All') {
            $query->where('resource_type', $request->resource_type);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('course_code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $resources = $query->get()->map(function ($r) use ($request) {
            return [
                'id' => $r->id,
                'title' => $r->title,
                'description' => $r->description,
                'department' => $r->department,
                'course' => $r->course_code,
                'semester' => $r->semester,
                'academic_year' => $r->academic_year,
                'type' => $r->resource_type,
                'file_url' => $r->file_path ? Storage::url($r->file_path) : null,
                'file_name' => $r->file_name,
                'size' => $r->file_size,
                'external_links' => $r->external_links ?? [],
                'uploader' => $r->user->name,
                'uploader_id' => $r->user->id,
                'uploader_avatar' => $r->user->profile->avatar ?? "https://ui-avatars.com/api/?name=" . urlencode($r->user->name) . "&background=random",
                'postedAt' => $r->created_at->diffForHumans(),
                'selfPosted' => $r->user_id === $request->user()->id,
                // Mocking rating/downloads since they are not tracked in DB yet
                'rating' => 5.0,
                'downloads' => rand(10, 500)
            ];
        });

        return response()->json($resources);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'department' => 'required|string',
            'course_code' => 'required|string|max:50',
            'semester' => 'required|string|max:50',
            'academic_year' => 'nullable|string|max:50',
            'resource_type' => 'required|string',
            'external_links' => 'nullable|json',
            'file' => 'required|file|max:51200|mimes:pdf,ppt,pptx,doc,docx,zip,rar,txt' // 50MB
        ]);

        $validatedData = $validated;
        if (isset($validated['external_links'])) {
            $validatedData['external_links'] = json_decode($validated['external_links'], true);
        }

        $resource = new Resource($validatedData);
        $resource->user_id = $request->user()->id;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('resources', 'public');
            $resource->file_path = $path;
            $resource->file_name = $file->getClientOriginalName();
            
            $size = $file->getSize();
            if ($size >= 1048576) {
                $resource->file_size = number_format($size / 1048576, 2) . ' MB';
            } elseif ($size >= 1024) {
                $resource->file_size = number_format($size / 1024, 2) . ' KB';
            } else {
                $resource->file_size = $size . ' bytes';
            }
        }

        $resource->save();

        return response()->json(['message' => 'Resource created successfully', 'id' => $resource->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $resource = Resource::findOrFail($id);

        if ($resource->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'department' => 'sometimes|string',
            'course_code' => 'sometimes|string|max:50',
            'semester' => 'sometimes|string|max:50',
            'academic_year' => 'nullable|string|max:50',
            'resource_type' => 'sometimes|string',
            'external_links' => 'nullable|json',
            'file' => 'nullable|file|max:51200|mimes:pdf,ppt,pptx,doc,docx,zip,rar,txt'
        ]);

        $validatedData = $validated;
        if (isset($validated['external_links'])) {
            $validatedData['external_links'] = json_decode($validated['external_links'], true);
        } else if ($request->has('external_links')) {
            $validatedData['external_links'] = null;
        }

        $resource->fill($validatedData);

        if ($request->hasFile('file')) {
            // Delete old file
            if ($resource->file_path && Storage::disk('public')->exists($resource->file_path)) {
                Storage::disk('public')->delete($resource->file_path);
            }

            $file = $request->file('file');
            $path = $file->store('resources', 'public');
            $resource->file_path = $path;
            $resource->file_name = $file->getClientOriginalName();
            
            $size = $file->getSize();
            if ($size >= 1048576) {
                $resource->file_size = number_format($size / 1048576, 2) . ' MB';
            } elseif ($size >= 1024) {
                $resource->file_size = number_format($size / 1024, 2) . ' KB';
            } else {
                $resource->file_size = $size . ' bytes';
            }
        }

        $resource->save();

        return response()->json(['message' => 'Resource updated successfully']);
    }

    public function destroy(Request $request, string $id)
    {
        $resource = Resource::findOrFail($id);

        if ($resource->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($resource->file_path && Storage::disk('public')->exists($resource->file_path)) {
            Storage::disk('public')->delete($resource->file_path);
        }

        $resource->delete();

        return response()->json(['message' => 'Resource deleted successfully']);
    }
}
