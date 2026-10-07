import 'package:flutter/material.dart';
import '../../../../../Controller/Homepage/my_payslip.dart';
import '../../../Profile/Sections/Salary/payslip_page.dart';
import 'paycheck_card.dart';

class Paycheck extends StatefulWidget {
  const Paycheck({super.key});

  @override
  State<Paycheck> createState() => _PaycheckState();
}

class _PaycheckState extends State<Paycheck> {
  late final Future<PaycheckData?> _latest = MyPayslip()
      .getLatest(); // load once

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PaycheckData?>(
      future: _latest,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const PaycheckCard(loading: true);
        }
        if (snap.hasError) return const PaycheckCard(failed: true);
        return PaycheckCard(
          data: snap.data,
          onViewPayslip: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const PayslipPage()),
          ),
        );
      },
    );
  }
}
