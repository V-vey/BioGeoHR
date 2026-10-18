import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../Controller/Homepage/my_loans.dart';

/// The employee's loans: what was borrowed, what is paid, what is left and when it should end.
class LoanPage extends StatefulWidget {
  const LoanPage({super.key});

  @override
  State<LoanPage> createState() => _LoanPageState();
}

class _LoanPageState extends State<LoanPage> {
  late final Future<List<LoanData>> _loans = MyLoans().get(); // load once

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

  Widget _divider() => Container(
    margin: const EdgeInsets.symmetric(vertical: 6),
    height: 1,
    color: const Color(0xFFE0E0E0),
  );

  Widget _badge(bool active) {
    final color = active ? const Color(0xFF6675EC) : const Color(0xFF2AAF56);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        active ? 'Active' : 'Paid',
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _card(LoanData l) {
    final day = DateFormat('MMM d, yyyy');
    final last = l.expectedLastDeduction();
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
          Row(
            children: [
              Text(
                '${l.type} loan',
                style: _text.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF3A3A3A),
                ),
              ),
              const Spacer(),
              _badge(l.active),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Started ${day.format(l.startDate)}',
            style: _text.copyWith(color: Colors.grey, fontSize: 13),
          ),
          _divider(),
          _row('Loan amount', _peso(l.total)),
          _row('Monthly deduction', _peso(l.monthly)),
          _row('Paid so far', _peso(l.paid)),
          _row('Remaining balance', _peso(l.remaining), bold: true),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: l.progress,
              minHeight: 8,
              backgroundColor: const Color(0xFFE0E0E0),
              color: const Color(0xFF2AAF56),
            ),
          ),
          if (l.active) ...[
            _divider(),
            _row('Deductions left', '${l.deductionsLeft}'),
            if (last != null)
              _row('Expected last deduction', DateFormat('MMM yyyy').format(last)),
            const SizedBox(height: 4),
            Text(
              'Taken once a month from your first payroll cutoff (the 1st to the 15th).',
              style: _text.copyWith(color: Colors.grey, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Loans')), // has the back arrow
      body: FutureBuilder<List<LoanData>>(
        future: _loans,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return const Center(child: Text('Could not load your loans'));
          }
          final loans = snap.data ?? <LoanData>[];
          if (loans.isEmpty) {
            return const Center(child: Text('No loans'));
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                for (final l in loans) ...[
                  _card(l),
                  const SizedBox(height: 16),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
