import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

class PaycheckData {
  final DateTime periodStart;
  final DateTime periodEnd;
  final double gross;
  final double deductions;
  final double net;

  // the deduction lines (the Payslip page); 0 when the server does not send them
  final double sss;
  final double philhealth;
  final double pagibig;
  final double tax;
  final double late;
  final double loan;
  final double other;

  PaycheckData({
    required this.periodStart,
    required this.periodEnd,
    required this.gross,
    required this.deductions,
    required this.net,
    this.sss = 0,
    this.philhealth = 0,
    this.pagibig = 0,
    this.tax = 0,
    this.late = 0,
    this.loan = 0,
    this.other = 0,
  });

  // the server sends whole numbers as ints (10640), so read them as `num` and convert
  factory PaycheckData.fromJson(Map<String, dynamic> j) => PaycheckData(
    periodStart: DateTime.parse(j['period_start']),
    periodEnd: DateTime.parse(j['period_end']),
    gross: (j['gross'] as num).toDouble(),
    deductions: (j['deductions'] as num).toDouble(),
    net: (j['net'] as num).toDouble(),
    sss: (j['sss'] as num? ?? 0).toDouble(),
    philhealth: (j['philhealth'] as num? ?? 0).toDouble(),
    pagibig: (j['pagibig'] as num? ?? 0).toDouble(),
    tax: (j['tax'] as num? ?? 0).toDouble(),
    late: (j['late'] as num? ?? 0).toDouble(),
    loan: (j['loan'] as num? ?? 0).toDouble(),
    other: (j['other'] as num? ?? 0).toDouble(),
  );
}

class MyPayslip {
  final Url _api = Url();

  /// The latest payslip, or null when payroll has not run for this person yet (404).
  Future<PaycheckData?> getLatest() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      Uri.parse(_api.getMyPayslip()),
      headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
    );

    if (response.statusCode == 200) {
      return PaycheckData.fromJson(jsonDecode(response.body));
    }
    if (response.statusCode == 404) return null; // "No payslip yet"
    throw Exception('Failed to load payslip: ${response.statusCode}');
  }
}
