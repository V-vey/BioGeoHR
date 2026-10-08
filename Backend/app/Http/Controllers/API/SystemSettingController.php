<?php

namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemSetting;
use App\Models\AuditLog;

class SystemSettingController extends Controller
{
    public function index()
    {
        $setting = SystemSetting::first();

        return response()->json($setting);
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
        ]);

        $changed = [];
        foreach ($data as $field => $value) {
            if ((int) $setting->$field !== (int) $value) {
                $changed[] = "{$field}: {$setting->$field} -> {$value}";
            }
        }

        $setting->update($data);
        if ($changed) {
            AuditLog::record('admin', 'settings_updated', 'success', implode('; ', $changed));
        }

        return response()->json(['message' => 'Update Successful'] + $setting->only([
            'late_grace_period_minutes', 'geofence_check_interval_minutes',
        ]));
    }

}
