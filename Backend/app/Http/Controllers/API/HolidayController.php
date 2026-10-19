<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
        $data = $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'name' => 'required|string',
            'type' => ['required', Rule::in(Holiday::TYPES)],
        ], [
            'date.unique' => 'There is already a holiday on that date.',
        ]);

        $holiday = Holiday::create($data);
        AuditLog::record('admin', 'holiday_added', 'success', "{$holiday->name} ({$request->date}), {$holiday->type}");
        
        return response()->json($holiday, 201);
    }

    public function update(Request $request, string $id)
    {
        $holiday = Holiday::find($id);
        if (!$holiday) {
            return response()->json(['message' => 'Holiday not found'], 404);
        }

        $data = $request->validate([
            'date' => ['required', 'date', Rule::unique('holidays', 'date')->ignore($holiday->id)],
            'name' => 'required|string',
            'type' => ['required', Rule::in(Holiday::TYPES)],
        ], [
            'date.unique' => 'There is already a holiday on that date.',
        ]);

        $holiday->update($data);
        AuditLog::record('admin', 'holiday_updated', 'success', "{$holiday->name} ({$holiday->date}), {$holiday->type}");

        return response()->json($holiday);
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
