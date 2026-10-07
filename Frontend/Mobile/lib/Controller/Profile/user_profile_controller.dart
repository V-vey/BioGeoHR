import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// import '../../Service/AuthStorage.dart';
import '../../Service/url.dart';

class UserProfileController {
  final Url _api = Url();

  Future<
    (
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      String, // 12th: the photo path ("avatars/xxx.png"), or '' when there is none
      String, // 13th: the previous login time, or '' when there is none
      bool, // 14th: is the account active
    )
  >
  getUserProfile() async {
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
    Map<String, dynamic> jsonResponse = await jsonDecode(response.body);

    if (response.statusCode == 200) {
      return (
        jsonResponse['name'].toString(),
        jsonResponse['email'].toString(),
        jsonResponse['contact'].toString(),
        jsonResponse['department'].toString(),
        jsonResponse['position'].toString(),
        jsonResponse['date_of_birth'].toString(),
        jsonResponse['gender'].toString(),
        jsonResponse['nationality'].toString(),
        jsonResponse['address'].toString(),
        jsonResponse['created_at'].toString(),
        jsonResponse['updated_at'].toString(),
        // null for people without a photo; plain .toString() would turn it into the text "null"
        jsonResponse['image_path']?.toString() ?? '',
        jsonResponse['last_login']?.toString() ?? '',
        jsonResponse['is_active'] != false,
      );
    } else {
      throw Exception('Failed to load leave balance: ${response.statusCode}');
    }
  }
}
