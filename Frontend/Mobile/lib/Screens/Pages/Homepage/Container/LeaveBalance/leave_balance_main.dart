import '../../../../../Controller/Homepage/leave_balance.dart' as api;
import 'package:flutter/material.dart';
import 'leave_balance_compact.dart';

class HomeLeaveBalance extends StatefulWidget {
  const HomeLeaveBalance({super.key});

  @override
  State<HomeLeaveBalance> createState() => _HomeLeaveBalanceState();
}

class _HomeLeaveBalanceState extends State<HomeLeaveBalance> {
  late final Future<api.LeaveBalances> _balances = api.LeaveBalance()
      .getBalanceLeave();

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
