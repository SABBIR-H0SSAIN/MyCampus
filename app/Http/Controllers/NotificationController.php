<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications;
        
        $formatted = $notifications->map(function($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'New Notification',
                'message' => $notification->data['message'] ?? '',
                'type' => $notification->data['type'] ?? 'info',
                'time' => $notification->created_at->diffForHumans(),
                'unread' => is_null($notification->read_at),
                'link' => $notification->data['link'] ?? null,
            ];
        });

        return response()->json([
            'notifications' => $formatted
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
