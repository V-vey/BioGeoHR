import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/url.dart';

class LoanData {
  final String type;
  final double total;
  final double monthly;
  final double remaining;
  final DateTime startDate;
  final String status; // Active or Paid

  LoanData({
    required this.type,
    required this.total,
    required this.monthly,
    required this.remaining,
    required this.startDate,
    required this.status,
  });

  bool get active => status == 'Active';
  double get paid => (total - remaining).clamp(0, total).toDouble();
  double get progress => total <= 0 ? 0 : paid / total;

  /// How many monthly deductions are still to come.
  int get deductionsLeft =>
      monthly <= 0 ? 0 : (double.parse((remaining / monthly).toStringAsFixed(6))).ceil();

  /// The month of the last deduction, worked out the way the web does it: one deduction a month,
  /// taken in the first cutoff (the 1st to the 15th), counted from today or the start date if later.
  /// Null when the loan is paid.
  DateTime? expectedLastDeduction([DateTime? now]) {
    if (!active || deductionsLeft == 0) return null;
    final today = now ?? DateTime.now();
    final from = startDate.isAfter(today) ? startDate : today;
    final firstMonth = from.year * 12 + (from.month - 1) + (from.day <= 15 ? 0 : 1);
    final last = firstMonth + deductionsLeft - 1;
    return DateTime(last ~/ 12, last % 12 + 1);
  }

  // Laravel sends decimals as text ("12000.00"), so read them from either a number or a string
  static double _num(dynamic v) => double.tryParse(v.toString()) ?? 0;

  factory LoanData.fromJson(Map<String, dynamic> j) => LoanData(
    type: j['loan_type']?.toString() ?? 'Loan',
    total: _num(j['total_amount']),
    monthly: _num(j['monthly_deduction']),
    remaining: _num(j['remaining_balance']),
    startDate: DateTime.parse(j['start_date'].toString().substring(0, 10)),
    status: j['status']?.toString() ?? 'Active',
  );
}

class MyLoans {
  final Url _api = Url();

  /// The employee's own loans, the running one first. An empty list means no loans.
  Future<List<LoanData>> get() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final response = await http.get(
      Uri.parse(_api.getMyLoans()),
      headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load loans: ${response.statusCode}');
    }
    final loans = (jsonDecode(response.body) as List)
        .map((e) => LoanData.fromJson(e as Map<String, dynamic>))
        .toList();
    loans.sort((a, b) {
      if (a.active != b.active) return a.active ? -1 : 1;
      return b.startDate.compareTo(a.startDate);
    });
    return loans;
  }
}
