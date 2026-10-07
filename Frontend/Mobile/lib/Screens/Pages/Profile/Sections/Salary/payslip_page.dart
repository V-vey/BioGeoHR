import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../Controller/Homepage/my_payslip.dart';

/// The employee's latest payslip, line by line: gross, each deduction, net pay.
class PayslipPage extends StatefulWidget {
  const PayslipPage({super.key});

  @override
  State<PayslipPage> createState() => _PayslipPageState();
}

class _PayslipPageState extends State<PayslipPage> {
  late final Future<PaycheckData?> _latest = MyPayslip().getLatest(); // load once

  static const _text = TextStyle(
    color: Color(0xBF3A3A3A),
    fontFamily: 'Roboto',
    fontSize: 15,
  );

  String _peso(double v) => '₱${NumberFormat('#,##0.00').format(v)}';

  Widget _row(String label, String value, {bool bold = false}) {
    final style = bold
        ? _text.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF3A3A3A))
        : _text;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(label, style: style),
          const Spacer(),
          Text(value, style: style),
        ],
      ),
    );
  }

  // a deduction is shown with a minus sign; zero lines stay visible so the employee sees "nothing taken"
  Widget _deduction(String label, double v) =>
      _row(label, v == 0 ? _peso(0) : '- ${_peso(v)}');

  Widget _divider() => Container(
    margin: const EdgeInsets.symmetric(vertical: 6),
    height: 1,
    color: const Color(0xFFE0E0E0),
  );

  Widget _slip(PaycheckData p) {
    final day = DateFormat('MMM d, yyyy');
    return Container(
      width: 350,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: const Color(0xFFFCFCFC),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${day.format(p.periodStart)} – ${day.format(p.periodEnd)}',
            style: _text.copyWith(color: Colors.grey, fontSize: 13),
          ),
          _divider(),
          _row('Gross Pay', _peso(p.gross), bold: true),
          _divider(),
          _deduction('SSS', p.sss),
          _deduction('PhilHealth', p.philhealth),
          _deduction('Pag-IBIG', p.pagibig),
          _deduction('Income Tax', p.tax),
          _deduction('Late', p.late),
          _deduction('Loan', p.loan),
          if (p.other != 0) _deduction('Other', p.other),
          _divider(),
          _row('Total Deductions', _peso(p.deductions)),
          _row('Net Pay', _peso(p.net), bold: true),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payslip')), // has the back arrow
      body: FutureBuilder<PaycheckData?>(
        future: _latest,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return const Center(child: Text('Could not load your payslip'));
          }
          final data = snap.data;
          if (data == null) {
            return const Center(child: Text('No payslip yet'));
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Center(child: _slip(data)),
          );
        },
      ),
    );
  }
}
