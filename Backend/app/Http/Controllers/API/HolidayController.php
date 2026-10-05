<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Holiday;
use App\Models\AuditLog;

class HolidayController extends Controller
{
    public function index()
    {
        $holidays = Holiday::orderBy('date')->get();
        return response()->json($holidays);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'name' => 'required|string',
        ]);
        AuditLog::record('admin', 'holiday_added', 'success', "{$holiday->name} ({$request->date})");
        $holiday = Holiday::create($request->only(['date', 'name']));
        return response()->json($holiday, 201);
    }

    public function destroy(string $id)
    {
        $holiday = Holiday::find($id);
        if (!$holiday) {
            
            return response()->json(['message' => 'Holiday not found'], 404);
        }
        $holiday->delete();
        AuditLog::record('admin', 'holiday_deleted', 'success', "{$holiday->name} ({$holiday->date})");
        return response()->json(['message' => 'Holiday deleted successfully']);
    }
}