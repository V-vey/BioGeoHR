import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// import '../../Service/AuthStorage.dart';
import '../../Service/url.dart';

/// A spouse or a child of the employee, as HR saved it. Shown on the profile only.
class FamilyMember {
  final String relationship; // Spouse or Child
  final String name;
  final String birthday; // yyyy-MM-dd, or '' when HR left it blank

  const FamilyMember({
    required this.relationship,
    required this.name,
    required this.birthday,
  });
}

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
      // 15th: details HR saved that are not needed to log in ('' for each one that is not set
      // yet), keyed tin / sss / philhealth / pagibig (government numbers) and status
      // (Contractual or Permanent)
      Map<String, String>,
      List<FamilyMember>, // 16th: the spouse and children (empty when none)
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
        {
          'tin': jsonResponse['tin']?.toString() ?? '',
          'sss': jsonResponse['sss_number']?.toString() ?? '',
          'philhealth': jsonResponse['philhealth_number']?.toString() ?? '',
          'pagibig': jsonResponse['pagibig_number']?.toString() ?? '',
          'status': jsonResponse['employment_status']?.toString() ?? '',
        },
        [
          for (final m in (jsonResponse['family'] as List? ?? const []))
            FamilyMember(
              relationship: m['relationship']?.toString() ?? '',
              name: m['name']?.toString() ?? '',
              birthday: m['birthday']?.toString().split(' ').first ?? '',
            ),
        ],
      );
    } else {
      throw Exception('Failed to load leave balance: ${response.statusCode}');
    }
  }
}
