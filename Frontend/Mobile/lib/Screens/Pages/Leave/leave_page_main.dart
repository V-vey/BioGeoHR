import 'package:flutter/material.dart';

import 'LeaveBalance/leave_balance.dart';
import 'leave_history.dart';

class LeavePageMain extends StatefulWidget {
  const LeavePageMain({super.key});

  @override
  State<LeavePageMain> createState() => _LeavePageMainState();
}

class _LeavePageMainState extends State<LeavePageMain> {
  int reload = 0;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        margin: const EdgeInsets.all(15),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            LeaveBalance(
              key: ValueKey('bal$reload'),
              onApplied: () => setState(() => reload++),
            ),
            const SizedBox(height: 15),
            LeaveHistory(key: ValueKey('his$reload')),
          ],
        ),
      ),
    );
  }
}
