import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// import '../../Service/AuthStorage.dart';
import '../../Service/url.dart';

class UserProfileController {
  final Url _api = Url();

  Future<(String, String, String, String, String)> getUserProfile() async {
    //get global var
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");

    //ignore ?? why but its working?
    final url = Uri.parse(_api.userProfile());
    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );
    print(response.body);
    Map<String, dynamic> jsonResponse = await jsonDecode(response.body);

    if (response.statusCode == 200) {
      return (
        jsonResponse['name'].toString(),
        jsonResponse['email'].toString(),
        jsonResponse['contact'].toString(),
        jsonResponse['role'].toString(),
        jsonResponse['department'].toString(),
      );
    } else {
      throw Exception('Failed to load leave balance: ${response.statusCode}');
    }
  }
}
