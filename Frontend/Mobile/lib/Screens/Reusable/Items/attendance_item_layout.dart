// ignore_for_file: file_names

import 'package:flutter/material.dart';
import '../Badge/attendance_badge.dart';

class AttendanceItemLayout extends StatelessWidget {
  final String status;
  final String location;
  final String date;
  final bool isVisible;

  const AttendanceItemLayout({
    super.key,
    required this.status,
    required this.location,
    required this.date,
    required this.isVisible,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(7.5),
        color: Color(0xFFFCFCFC),
      ),
      child: Column(
        children: [
          //Top Part
          Container(
            padding: EdgeInsets.only(top: 5, bottom: 5, right: 15, left: 15),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      location,
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF3A3A3A),
                      ),
                    ),
                    Text(
                      date, //Date
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Color(0x503A3A3A),
                      ),
                    ),
                  ],
                ),
                AttendanceBadge(
                  status: status,
                ), // change the status to the flexible
              ],
            ),
          ),

          SizedBox(height: 5),
          if (isVisible) ...[
            Container(
              padding: EdgeInsets.only(left: 15, right: 15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
                  SizedBox(height: 5),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
