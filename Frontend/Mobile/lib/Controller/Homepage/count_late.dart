import '../../Service/url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CountLate {
  final Url _api = Url();

  Future<int> countLates() async {
    final url = Uri.parse(_api.countLate());
    final prefs = await SharedPreferences.getInstance();
    //access the user
    String? token = prefs.getString("token");

    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );
    Map<String, dynamic> jsonResponse = await jsonDecode(response.body);
    int data = jsonResponse["message"];
    return data;
    // return jsonResponse["message"].toString();
  }
}
