import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/Pages/Homepage/Container/RecentLeave/recent_leave.dart';

import 'Container/ClockIn/clock_in.dart';
import 'Container/LeaveBalance/leave_balance_main.dart';
import 'Container/TotalLate/total_late.dart';
import 'Container/Paycheck/paycheck.dart';
import 'Container/RecentAttendance/recent_attendance.dart';
// import 'Container/ClockIn/time.dart';
import 'Container/Welcome/welcome.dart';

class HomePageMain extends StatelessWidget {
  const HomePageMain({super.key});

  // bool get wantKeepAlive => true;

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
            // IntrinsicHeight + stretch: both cards take the height of the taller one (Late),
            // so Paycheck lines up with it instead of floating in the middle
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisAlignment: MainAxisAlignment.center,
                spacing: 15,
                children: [
                  Expanded(
                    child: Container(
                      margin: EdgeInsets.only(right: 7.5),
                      child: TotalLate(),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      margin: EdgeInsets.only(left: 7.5),
                      child: Paycheck(),
                    ),
                  ),
                ],
              ),
            ),
            HomeLeaveBalance(),
            RecentAttendancePage(),
            RecentLeave(),
          ],
        ),
      ),
    );

    return items;
  }
}
