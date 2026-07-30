import 'package:flutter/material.dart';

import 'Items/on_time.dart';
import 'Items/late.dart';

class MonthlyAttendance extends StatelessWidget {
  const MonthlyAttendance({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            //Ontime
            Container(
              width: 165,
              height: 90,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Color(0xFFFCFCFC),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(20),
                    blurRadius: 6.0,
                    spreadRadius: 4.0,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: OnTime(),
            ),
            SizedBox(width: 15),

            //Absent
            Container(
              width: 165,
              height: 90,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Color(0xFFFCFCFC),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(20),
                    blurRadius: 6.0,
                    spreadRadius: 4.0,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Late(),
            ),
          ],
        ),
      ],
    );
  }
}
