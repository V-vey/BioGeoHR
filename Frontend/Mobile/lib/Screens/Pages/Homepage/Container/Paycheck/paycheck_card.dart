import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../../Controller/Homepage/my_payslip.dart';

// the card itself: pure drawing, no loading.
// It has the same shape as the Late card next to it (centred title, a line, then the content),
// and it fills the height of the row, so the two cards line up.
class PaycheckCard extends StatelessWidget {
  final PaycheckData? data; // null = no payslip yet
  final bool loading;
  final bool failed;
  final VoidCallback? onViewPayslip; // tapping the card opens the payslip

  const PaycheckCard({
    super.key,
    this.data,
    this.loading = false,
    this.failed = false,
    this.onViewPayslip,
  });

  @override
  Widget build(BuildContext context) {
    final peso = NumberFormat.currency(locale: 'en_PH', symbol: '₱');
    final day = DateFormat('MMM d');

    Widget body;
    if (loading) {
      body = const SizedBox(
        width: 22,
        height: 22,
        child: CircularProgressIndicator(strokeWidth: 2),
      );
    } else if (failed) {
      body = const Text(
        'Unavailable',
        style: TextStyle(fontSize: 13, color: Colors.grey),
      );
    } else if (data == null) {
      body = const Text(
        'No payslip yet',
        style: TextStyle(fontSize: 13, color: Colors.grey),
      );
    } else {
      body = Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // FittedBox: a big amount shrinks to fit instead of overflowing the half-width card
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                peso.format(data!.net),
                style: const TextStyle(
                  fontFamily: 'Roboto',
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF3A3A3A),
                ),
              ),
            ),
            Text(
              '${day.format(data!.periodStart)} – ${day.format(data!.periodEnd)}',
              style: const TextStyle(
                fontFamily: 'Roboto',
                fontSize: 11,
                color: Colors.grey,
              ),
            ),
            if (onViewPayslip != null)
              const Text(
                'View Payslip ›',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF6675EC),
                ),
              ),
          ],
        ),
      );
    }

    final card = Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 4), // same as the Late card
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
        children: [
          // same title style and position as "Late"
          Container(
            padding: const EdgeInsets.all(5),
            child: const Text(
              'Paycheck',
              style: TextStyle(
                fontFamily: 'Roboto',
                color: Color(0xFF6675EC),
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(height: 1, width: double.infinity, color: const Color(0xFFE0E0E0)),
          // the content sits in the middle of the space under the line
          Expanded(child: Center(child: body)),
        ],
      ),
    );

    // only tappable when there is a payslip to open
    if (data == null || onViewPayslip == null) return card;
    return GestureDetector(onTap: onViewPayslip, child: card);
  }
}
