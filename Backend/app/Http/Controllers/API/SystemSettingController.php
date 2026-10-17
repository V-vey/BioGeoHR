<?php

namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Models\Users;

class SystemSettingController extends Controller
{
    public function index()
    {
        $setting = SystemSetting::first();

        return response()->json($setting);
    }

    /**
     * The Working Hours page's "Employee schedules" table: active employees with the start time from
     * their profile and the hours a day from their salary, one page at a time.
     *   ?page=1&per_page=10&search=maria
     * Paged and searched by the database, so it stays small however many employees there are.
     */
    public function schedules(Request $request)
    {
        $request->validate([
            'search'   => 'sometimes|nullable|string|max:100',
            'page'     => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $query = Users::active()
            ->select('id', 'name', 'department', 'call_time')
            ->with('salary:user_id,working_hours_per_day')
            ->orderBy('name')->orderBy('id');
        if ($term = trim((string) $request->input('search'))) {
            // % and _ typed by the user must not act as wildcards
            $query->where('name', 'like', '%' . addcslashes($term, '%_\\') . '%');
        }
        $page = $query->paginate((int) $request->input('per_page', 10));

        $rows = $page->getCollection()->map(fn ($u) => [
            'id'                    => $u->id,
            'name'                  => $u->name,
            'department'            => $u->department,
            'call_time'             => $u->call_time,
            'working_hours_per_day' => $u->salary?->working_hours_per_day,
        ])->values();

        return response()->json([
            'data'         => $rows,
            'current_page' => $page->currentPage(),
            'last_page'    => $page->lastPage(),
            'per_page'     => $page->perPage(),
            'total'        => $page->total(),
        ]);
    }

    /**
     * HR changes the working-hour settings (FR36): the late grace period and how often the phone
     * re-checks that a clocked-in employee is still inside the geofence.
     */
    public function update(Request $request, string $id){
        $setting = SystemSetting::find($id);
        if (!$setting){
            return response()->json(['message' => 'System Setting not found'], 404);
        }

        $data = $request->validate([
            'late_grace_period_minutes'       => 'sometimes|required|integer|min:0|max:120',
            // Android runs a background task no more often than every 15 minutes
            'geofence_check_interval_minutes' => 'sometimes|required|integer|min:15|max:120',
            'school_year_start' => 'sometimes|required|date',
            'school_year_end'   => 'sometimes|required|date|after:school_year_start',
        ]);

        $changed = [];
        foreach ($data as $field => $value) {
            if ((string) $setting->$field !== (string) $value) {
                $changed[] = "{$field}: {$setting->$field} -> {$value}";
            }
        }

        $setting->update($data);
        if ($changed) {
            AuditLog::record('admin', 'settings_updated', 'success', implode('; ', $changed));
        }

        return response()->json(['message' => 'Update Successful'] + $setting->only([
            'late_grace_period_minutes', 'geofence_check_interval_minutes', 'school_year_start', 'school_year_end'
        ]));
    }

}
