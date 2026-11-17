<?php 
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\AuditLog;
use App\Rules\StrongPassword;


class PasswordController extends Controller
{
    // the rule (8 characters, uppercase, lowercase, number) is in App\Rules\StrongPassword
    public function update(Request $request)
    {
        // 1. Validate the incoming request data
        $request->validate([
            'current_password' => ['required', 'current_password'], // Validates against logged-in user
            'password' => ['required', 'confirmed', new StrongPassword], // Requires 'password_confirmation' field
        ]);

        // 2. Update the authenticated user's password
        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        // every other session (another phone, a stolen login) ends with the old password; this one stays
        $others = $request->user()->tokens();
        if ($currentId = $request->user()->currentAccessToken()?->id) {
            $others->where('id', '!=', $currentId);
        }
        $ended = $others->delete();

        // the new password itself is never written down, only that it was changed
        AuditLog::record('login', 'password_changed', 'success', "Password changed; {$ended} other session(s) ended");

        return response()->json([
            'success' => true,
            'message' => 'Password has been successfully updated.'
        ], 201);
    }
}
