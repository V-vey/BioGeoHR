import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

class SalaryData {
  final double monthlySalary;
  final double hoursPerDay;
  final double daysPerMonth;
  final double dailyRate;
  final double hourlyRate;

  SalaryData({
    required this.monthlySalary,
    required this.hoursPerDay,
    required this.daysPerMonth,
    required this.dailyRate,
    required this.hourlyRate,
  });

  // the server sends whole numbers as ints (22000), so read them as `num` and convert
  factory SalaryData.fromJson(Map<String, dynamic> j) => SalaryData(
    monthlySalary: (j['monthly_salary'] as num).toDouble(),
    hoursPerDay: (j['working_hours_per_day'] as num).toDouble(),
    daysPerMonth: (j['working_days_per_month'] as num).toDouble(),
    dailyRate: (j['daily_rate'] as num).toDouble(),
    hourlyRate: (j['hourly_rate'] as num).toDouble(),
  );
}

class MySalary {
  final Url _api = Url();

  /// The employee's salary, or null when HR has not set one yet (404).
  Future<SalaryData?> get() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      Uri.parse(_api.getMySalary()),
      headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
    );

    if (response.statusCode == 200) {
      return SalaryData.fromJson(jsonDecode(response.body));
    }
    if (response.statusCode == 404) return null; // "No salary record yet"
    throw Exception('Failed to load salary: ${response.statusCode}');
  }
}
