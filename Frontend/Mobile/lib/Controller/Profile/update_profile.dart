import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

/// What the server answered to a profile update.
class UpdateProfileResult {
  final bool ok; // true = saved
  final String message; // text to show the employee

  UpdateProfileResult(this.ok, this.message);
}

class UpdateProfile {
  final Url _api = Url();

  /// Sends the contact number and address, and the photo only when a new one was picked.
  Future<UpdateProfileResult> send({
    required String contact,
    required String address,
    File? image,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      // multipart, because a photo can travel with the text fields
      final request = http.MultipartRequest('POST', Uri.parse(_api.updateProfile()))
        ..headers.addAll({
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        })
        ..fields['contact_number'] = contact
        ..fields['address'] = address;
      if (image != null) {
        request.files.add(await http.MultipartFile.fromPath('image', image.path));
      }

      final response = await http.Response.fromStream(await request.send());

      if (response.statusCode == 401) {
        return UpdateProfileResult(false, 'Your session expired. Please log in again.');
      }

      // 200 {"message": "Profile updated"}  or  422 {"message": "...", "errors": {...}}
      String? message;
      try {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        message = body['message']?.toString();
        final errors = body['errors'];
        if (errors is Map && errors.isNotEmpty) {
          // the first validation message is the useful one ("Enter a valid phone number.")
          final first = errors.values.first;
          message = first is List && first.isNotEmpty ? first.first.toString() : message;
        }
      } catch (_) {
        // not JSON (for example an HTML error page): use the generic text below
      }

      if (response.statusCode == 200) {
        return UpdateProfileResult(true, message ?? 'Profile updated');
      }
      return UpdateProfileResult(
        false,
        message ?? 'Could not save your changes (${response.statusCode})',
      );
    } catch (_) {
      return UpdateProfileResult(false, 'Could not reach the server. Check your connection.');
    }
  }
}
