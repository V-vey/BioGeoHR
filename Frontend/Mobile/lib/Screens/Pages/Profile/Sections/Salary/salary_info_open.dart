import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../Controller/Profile/my_salary.dart';

class SalaryInfoOpen extends StatelessWidget {
  final SalaryData? salary; // null = HR has not set a salary yet
  const SalaryInfoOpen({super.key, required this.salary});

  String _peso(double v) => '₱${NumberFormat('#,##0.00').format(v)}';

  // 8.0 -> "8", 7.5 -> "7.5"
  String _num(double v) => v == v.roundToDouble() ? '${v.toInt()}' : '$v';

  Widget _row(String label, String value) {
    const style = TextStyle(
      color: Color(0xBF3A3A3A),
      fontFamily: 'Roboto',
      fontSize: 15,
      fontWeight: FontWeight.normal,
    );
    return Row(
      children: [
        Text(label, style: style),
        Spacer(),
        Text(value, style: style),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = salary;
    return Container(
      width: 350,
      padding: EdgeInsets.all(10),
      child: s == null
          ? Text(
              "No salary has been set for you yet.",
              style: TextStyle(
                color: Color(0xBF3A3A3A),
                fontFamily: 'Roboto',
                fontSize: 15,
              ),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 5,
              children: [
                _row("Monthly Salary:", _peso(s.monthlySalary)),
                _row("Working Days / Month:", _num(s.daysPerMonth)),
                _row("Working Hours / Day:", _num(s.hoursPerDay)),
                _row("Daily Rate:", _peso(s.dailyRate)),
                _row("Hourly Rate:", _peso(s.hourlyRate)),
              ],
            ),
    );
  }
}
