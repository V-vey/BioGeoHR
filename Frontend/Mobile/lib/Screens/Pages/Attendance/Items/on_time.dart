import 'package:flutter/material.dart';

import 'monthly_counter.dart';

class OnTime extends StatelessWidget {
  final int? days; // days on time this month; null = still loading or failed
  const OnTime({super.key, this.days});

  @override
  Widget build(BuildContext context) {
    return MonthlyCounter(
      icon: Icons.alarm,
      color: const Color(0xFF2AAF56),
      label: 'On-Time',
      days: days,
    );
  }
}
