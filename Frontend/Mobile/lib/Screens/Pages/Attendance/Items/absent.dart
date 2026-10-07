import 'package:flutter/material.dart';

import 'monthly_counter.dart';

class Absent extends StatelessWidget {
  final int? days; // days absent this month; null = still loading or failed
  const Absent({super.key, this.days});

  @override
  Widget build(BuildContext context) {
    return MonthlyCounter(
      icon: Icons.event_busy,
      color: const Color(0xFFEC6668),
      label: 'Absent',
      days: days,
    );
  }
}
