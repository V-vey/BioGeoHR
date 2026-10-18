import 'dart:convert';
import 'package:http/http.dart' as http;

import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

/// What the server answered to a password change.
class ChangePasswordResult {
  final bool ok; // true = the password was changed
  final String message; // text to show the employee

  ChangePasswordResult(this.ok, this.message);
}

/// The password rule, the same one the server enforces (App\Rules\StrongPassword):
/// at least 8 characters with an uppercase letter, a lowercase letter and a number.
/// Returns what is wrong with the password, or null when it is fine.
String? passwordProblem(String password) {
  final ok =
      password.runes.length >= 8 &&
      RegExp(r'\p{Lu}', unicode: true).hasMatch(password) &&
      RegExp(r'\p{Ll}', unicode: true).hasMatch(password) &&
      RegExp(r'\d').hasMatch(password);
  return ok
      ? null
      : 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';
}

class ChangePassword {
  final Url api = Url();

  Future<ChangePasswordResult> changePassword(
    String currentPassword,
    String newPassword,
    String reTypePassword,
  ) async {
    try {
      final url = Uri.parse(api.changePassword());
      final prefs = await SharedPreferences.getInstance();
      //access the user
      String? token = prefs.getString("token");

      final response = await http.post(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: jsonEncode({
          "current_password": currentPassword,
          "password": newPassword,
          "password_confirmation": reTypePassword,
        }),
      );

      if (response.statusCode == 201) {
        return ChangePasswordResult(true, 'Your password was changed.');
      }

      // 422 {"message": "...", "errors": {"password": ["..."]}}: the first message is the useful one
      String? message;
      try {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        message = body['message']?.toString();
        final errors = body['errors'];
        if (errors is Map && errors.isNotEmpty) {
          final first = errors.values.first;
          message = first is List && first.isNotEmpty ? first.first.toString() : message;
        }
      } catch (_) {
        // not JSON: use the generic text below
      }
      return ChangePasswordResult(
        false,
        message ?? 'Could not change your password (${response.statusCode})',
      );
    } catch (_) {
      return ChangePasswordResult(false, 'Could not reach the server. Check your connection.');
    }
  }
}
