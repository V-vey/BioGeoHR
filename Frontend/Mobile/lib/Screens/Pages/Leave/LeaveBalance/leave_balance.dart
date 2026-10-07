import 'package:flutter/material.dart';
import '../../../../../Controller/Homepage/leave_balance.dart'
    as api; // prefix: avoids the LeaveBalance name clash
import 'leave_balance_panel.dart';

class LeaveBalance extends StatefulWidget {
  const LeaveBalance({super.key});

  @override
  State<LeaveBalance> createState() => _LeaveBalanceItemState();
}

class _LeaveBalanceItemState extends State<LeaveBalance> {
  // load once, not on every rebuild
  late final Future<api.LeaveBalances> _balances = api.LeaveBalance()
      .getBalanceLeave();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<api.LeaveBalances>(
      future: _balances,
      builder: (context, snap) {
        if (snap.hasError) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Could not load your leave balance'),
          );
        }
        if (!snap.hasData) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        return LeaveBalancePanel(
          balances: snap.data!,
          name: '',
          onApply: () {},
        );
      },
    );
  }
}
