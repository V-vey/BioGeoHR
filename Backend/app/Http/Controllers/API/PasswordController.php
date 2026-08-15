<?php 
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;


class PasswordController extends Controller
{
    //8 characters needed
    public function update(Request $request)
    {
        // 1. Validate the incoming request data
        $request->validate([
            'current_password' => ['required', 'current_password'], // Validates against logged-in user
            'password' => ['required', 'confirmed', Password::defaults()], // Requires 'password_confirmation' field
        ]);

        // 2. Update the authenticated user's password
        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password has been successfully updated.'
        ], 201);
    }
}
