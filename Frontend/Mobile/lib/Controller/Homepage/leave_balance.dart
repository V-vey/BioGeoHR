import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// import '../../Service/AuthStorage.dart';
import '../../Service/url.dart';

class LeaveBalances {
  final int sick,
      vacation,
      emergency,
      birthday,
      soloParent,
      paternity,
      maternity;

  LeaveBalances({
    required this.sick,
    required this.vacation,
    required this.emergency,
    required this.birthday,
    required this.soloParent,
    required this.paternity,
    required this.maternity,
  });

  factory LeaveBalances.fromJson(Map<String, dynamic> j) => LeaveBalances(
    sick: j['sick'] ?? 0,
    vacation: j['vacation'] ?? 0,
    emergency: j['emergency'] ?? 0,
    birthday: j['birthday'] ?? 0,
    soloParent: j['solo_parent'] ?? 0,
    paternity: j['paternity'] ?? 0,
    maternity: j['maternity'] ?? 0,
  );
}

class LeaveBalance {
  final Url api = Url();

  Future<LeaveBalances> getBalanceLeave() async {
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");

    final response = await http.get(
      Uri.parse(api.getLeaveBalance()),
      headers: {"Authorization": "Bearer $token", "Accept": "application/json"},
    );

    if (response.statusCode == 200) {
      return LeaveBalances.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to load leave balance: ${response.statusCode}');
  }
}
