import 'package:flutter/material.dart';

import 'monthly_counter.dart';

class Late extends StatelessWidget {
  final int? days; // days late this month; null = still loading or failed
  const Late({super.key, this.days});

  @override
  Widget build(BuildContext context) {
    return MonthlyCounter(
      icon: Icons.update,
      color: const Color(0xFFEACA3A),
      label: 'Late',
      days: days,
    );
  }
}
