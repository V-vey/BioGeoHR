// access the api
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../Service/url.dart';

class GetLocation {
  final Url api = Url();
  Future<List<String>> getLocation() async {
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");
    //access API

    final url = Uri.parse(api.getLocations());
    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );

    //Debug
    // print("Server Response Status Code: ${response.statusCode}");
    // print("Server Response Body: ${response.body}");

    //Making List
    List<dynamic> data = jsonDecode(response.body);
    List<String> names = data
        .map((item) => item['name']?.toString() ?? 'Unknown')
        .toList();

    return names;
  }
}
