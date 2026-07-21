import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../Service/Url.dart';

class Logout {
  final url api = url();
  Future<String> logoutUser() async {
    //get global token and id variables
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");
    String? userId = prefs.getString("id");

    //API
    final url = Uri.parse(api.getLogout());

    //Removing token from the database
    final response = await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: jsonEncode({"id": userId}),
    );

    //Removing global var
    prefs.remove('id');
    prefs.remove('token');

    return response.body;
  }
}
