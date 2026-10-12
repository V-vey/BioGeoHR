import '../../../../../Controller/Homepage/leave_balance.dart' as api;
import 'package:flutter/material.dart';
import 'leave_balance_compact.dart';

/// The Leave Balance card: loads the employee's credits and shows them. Used on the home screen
/// and on the Apply for leave page.
class HomeLeaveBalance extends StatefulWidget {
  // optional loader so the card can be tested without a server
  final Future<api.LeaveBalances> Function()? loader;

  const HomeLeaveBalance({super.key, this.loader});

  @override
  State<HomeLeaveBalance> createState() => _HomeLeaveBalanceState();
}

class _HomeLeaveBalanceState extends State<HomeLeaveBalance> {
  late final Future<api.LeaveBalances> _balances =
      (widget.loader ?? api.LeaveBalance().getBalanceLeave)();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<api.LeaveBalances>(
      future: _balances,
      builder: (context, snap) {
        if (snap.hasError)
          return const Text('Could not load your leave balance');
        if (!snap.hasData)
          return const Center(child: CircularProgressIndicator());
        return LeaveBalanceCompact(balances: snap.data!, onTap: () {});
      },
    );
  }
}
