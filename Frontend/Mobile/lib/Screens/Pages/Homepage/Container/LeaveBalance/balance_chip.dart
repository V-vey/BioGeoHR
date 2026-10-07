import 'package:flutter/material.dart';

class BalanceChip extends StatelessWidget {
  final String label;
  final Color color;
  final int days;

  const BalanceChip({
    super.key,
    required this.label,
    required this.color,
    required this.days,
  });

  @override
  Widget build(BuildContext context) {
    final empty = days == 0;

    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Container(
        constraints: const BoxConstraints(minWidth: 72),
        decoration: BoxDecoration(
          color: empty ? const Color(0xFFF2F2F2) : const Color(0xFFFCFCFC),
          border: Border.all(color: const Color(0xFFE6E6E6)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 3,
              color: empty ? Colors.grey : color,
            ), // the colour stripe
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 11,
                      color: empty ? Colors.grey : const Color(0xFF3A3A3A),
                    ),
                  ),
                  Text(
                    '$days',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: empty ? Colors.grey : const Color(0xFF3A3A3A),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
