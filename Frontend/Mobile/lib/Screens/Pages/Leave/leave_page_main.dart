import 'package:flutter/material.dart';

import 'leave_balance.dart';
import 'leave_history.dart';

class LeavePageMain extends StatelessWidget {
  const LeavePageMain({super.key});

  @override
  Widget build(BuildContext context) {
    var items = Container(
      margin: EdgeInsets.all(15),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          LeaveBalance(
            annualBal: '12',
            patBal: '14',
            unpaidBal: '1',
            sickBal: '7',
          ),
          SizedBox(height: 15),
          LeaveHistory(),
        ],
      ),
    );

    return items;
  }
}
