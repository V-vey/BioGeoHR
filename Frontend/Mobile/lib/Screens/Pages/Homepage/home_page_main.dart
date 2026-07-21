import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/Pages/Homepage/Container/RecentLeave/recent_leave.dart';

import 'Container/ClockIn/clock_in.dart';
import 'Container/LeaveBalance/leave_balance.dart';
import 'Container/TotalLate/total_late.dart';
import 'Container/Paycheck/paycheck.dart';
import 'Container/RecentAttendance/recent_attendance.dart';
// import 'Container/ClockIn/time.dart';
import 'Container/Welcome/welcome.dart';

class HomePageMain extends StatelessWidget {
  const HomePageMain({super.key});

  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    var items = SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.all(15),
        child: Column(
          spacing: 15,
          children: [
            Welcome(),
            ClockIn(),
            Paycheck(),
            Row(
              children: [
                Container(
                  margin: EdgeInsets.only(right: 7.5),
                  child: TotalLate(),
                ),
                Container(
                  margin: EdgeInsets.only(left: 7.5),
                  child: LeaveBalance(),
                ),
              ],
            ),
            RecentAttendance(),
            RecentLeave(),
          ],
        ),
      ),
    );

    return items;
  }
}
