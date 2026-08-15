import 'dart:convert';
import 'package:http/http.dart' as http;
// import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/auth_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

class ChangePassword {
  final Url api = Url();
  void changePassword(
    String currentPassword,
    String newPassword,
    String reTypePassword,
  ) async {
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
    var result = jsonDecode(response.body);
    if (!(response.statusCode == 201)) {
      print("incorrect");
      return;
    }
    print("success");
  }
}
