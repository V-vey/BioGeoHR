import 'package:flutter/material.dart';

import '../../../../../Controller/Profile/my_salary.dart';
import 'payslip_page.dart';
import 'salary_info_open.dart';

class SalaryInfo extends StatefulWidget {
  const SalaryInfo({super.key});

  @override
  State<SalaryInfo> createState() => _SalaryInfoState();
}

class _SalaryInfoState extends State<SalaryInfo> {
  bool _isVisible = false;

  // loaded once, when the card is first opened
  Future<SalaryData?>? _salary;

  void _toggle() {
    setState(() {
      _isVisible = !_isVisible;
      _salary ??= MySalary().get();
    });
  }

  @override
  Widget build(BuildContext context) {
    var items = Stack(
      children: [
        Container(
          width: 350,
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Color(0xFFFCFCFC),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(20),
                blurRadius: 6.0,
                spreadRadius: 4.0,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Icon(Icons.payments, size: 30),
                  SizedBox(width: 10),
                  Text(
                    "Salary Info",
                    style: TextStyle(
                      color: Color(0xFF3A3A3A),
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Spacer(),
                  Icon(
                    _isVisible ? Icons.expand_more : Icons.chevron_right,
                    size: 30,
                  ),
                ],
              ),
              if (_isVisible) ...[
                SizedBox(height: 5),
                Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
                FutureBuilder<SalaryData?>(
                  future: _salary,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState != ConnectionState.done) {
                      return Padding(
                        padding: EdgeInsets.all(15),
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      );
                    }
                    if (snapshot.hasError) {
                      return Padding(
                        padding: EdgeInsets.all(10),
                        child: Text("Could not load salary info"),
                      );
                    }
                    return SalaryInfoOpen(salary: snapshot.data);
                  },
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const PayslipPage()),
                    ),
                    icon: Icon(Icons.receipt_long),
                    label: Text("View Payslip"),
                  ),
                ),
              ],
            ],
          ),
        ),

        //clickable Container to open (only the header row, so the button below stays tappable)
        GestureDetector(
          onTap: _toggle,
          child: Container(width: 350, height: 50, color: Color(0x00000000)),
        ),
      ],
    );
    return items;
  }
}
