import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
// import 'package:flutter_biogeohr/Screens/Pages/Attendance/Items/leave.dart';
import '../../../../../Service/leave_balance.dart';

class LeaveBalanceItem extends StatefulWidget {
  const LeaveBalanceItem({super.key});

  @override
  State<LeaveBalanceItem> createState() => _LeaveBalanceItemState();
}

class _LeaveBalanceItemState extends State<LeaveBalanceItem> {
  final LeaveBalance balance = LeaveBalance();
  String annual = 'Loading...';
  String sick = '';
  String paternity = '';
  String unpaid = '';

  @override
  void initState() {
    super.initState();
    // 2. Call the async function here without blocking initState
    _loadLeaveBalances();
  }

  // 3. Separate async logic into its own method
  Future<void> _loadLeaveBalances() async {
    final result = await balance.getBalanceLeave();

    // 4. Update the UI state using setState
    setState(() {
      annual = result.$1;
      sick = result.$2;
      paternity = result.$3;
      unpaid = result.$4;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 5, left: 10, right: 10),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [Text(annual)],
      ),
    );
  }
}
