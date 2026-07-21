import 'package:flutter/material.dart';

import '../../../../Reusable/Badge/leave_badge.dart';

class RecentLeaveItem extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      // width: 350,
      // height: 120,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(7.5),
        color: Color(0xFFFCFCFC),
      ),
      child: Container(
        child: Column(
          children: [
            //Top Part
            Container(
              padding: EdgeInsets.only(bottom: 5, right: 10, left: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  //Reason
                  Text(
                    'Sick Leave',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFF3A3A3A),
                    ),
                  ),

                  LeaveBadge(status: "Pending"),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
