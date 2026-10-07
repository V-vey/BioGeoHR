import 'package:flutter/material.dart';

/// One counter of the monthly row: an icon, the label and "N Days".
/// Compact on purpose, so three of them fit side by side on a phone.
class MonthlyCounter extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final int? days; // null = still loading or failed -> "-- Days"

  const MonthlyCounter({
    super.key,
    required this.icon,
    required this.color,
    required this.label,
    required this.days,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 32, color: color),
        Text(
          label,
          style: TextStyle(
            color: color,
            fontFamily: 'Roboto',
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          days == null ? '-- Days' : '$days ${days == 1 ? 'Day' : 'Days'}',
          style: const TextStyle(
            color: Color(0xFF3A3A3A),
            fontFamily: 'Roboto',
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}
