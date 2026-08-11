import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/Pages/Attendance/Items/atttendance_pages.dart';

import 'Items/attendance_item.dart';

class Attendance extends StatefulWidget {
  const Attendance({super.key});

  @override
  State<Attendance> createState() => _AttendanceState();
}

class _AttendanceState extends State<Attendance> {
  List resultsList = [];
  int currentPage = 0;
  int resultsPerPage = 10;
  int startPage = 0;
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        width: 350,
        constraints: const BoxConstraints(
          maxHeight:
              520, // The item block will NEVER go further than 400 pixels wide
        ),
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
        child: Column(
          spacing: 5,
          children: [
            SizedBox(),
            Container(
              padding: EdgeInsets.all(5),
              child: Text(
                'All Attendance',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0xFF6675EC),
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
            AttendanceItems(),

            Spacer(),

            // Padding(
            // padding: const EdgeInsets.(
            //   vertical: 10,
            // ), // Optional padding
            Column(
              children: [
                Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
                AttendancePages(pageNum: 1),
              ],
            ),
            // ),
          ],
        ),
      ),
    );
  }
}
