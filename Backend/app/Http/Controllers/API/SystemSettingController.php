<?php

namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SystemSetting;

class SystemSettingController extends Controller
{
    public function index()
    {
        $setting = SystemSetting::first();

        return response()->json($setting);
    }
    
    public function update(Request $request, string $id){
        $setting = SystemSetting::find($id);
        if (!$setting){
            return response()->json(['message' => 'System Setting not found'], 404);
        }
        $setting->update($request->first());
        return response()->json(['message' => 'Update Successful']);
    }

}
