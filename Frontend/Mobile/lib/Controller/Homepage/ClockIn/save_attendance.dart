import '../../../Service/auth_storage.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../../Service/url.dart';

class SaveAttendance {
  final Url api = Url();
  final AuthStorage store = AuthStorage();
  late Future<String?> userId;
  late Future<String?> location;
  void init() async {
    userId = store.getUserId();
    location = store.getTemp();
  }

  void saveAttendance(String timeIn, date) async {
    init();
    final url = Uri.parse(api.postAttendance());
    http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({
        "user_id": userId,
        "location_name": location,
        "date": DateTime.now(),
        "time_in": timeIn,
      }),
    );
  }
}
