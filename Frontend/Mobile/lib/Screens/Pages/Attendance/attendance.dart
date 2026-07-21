import 'package:flutter/material.dart';

import '../../Reusable/Items/AttendanceItem.dart';

class Attendance extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return 
      Container(
      width: 350,
      height: 430,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: Color(0xFFFCFCFC),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 6.0,
            spreadRadius: 4.0,
            offset: const Offset(0, 2)
          )
        ]
      ),
      child: Column(
        spacing: 5,
        children: [
          SizedBox(),
          Container(
            padding: EdgeInsets.all(5),
            child:
            Text(
            'All Attendance',
            style: TextStyle(
              fontFamily: 'Roboto',
              color: Color(0xFF6675EC),
              fontSize: 18.0,
              fontWeight: FontWeight.bold,  
              ),
            ),
          ),
          Container(
            height: 1,
            width: 350,
            color: Color(0xFFE0E0E0),
          ),
          // soon change to scrollable
          AttendanceItem(status: "On-Time", location: "TSU San Isidro",date: '2026-07-08'),
          AttendanceItem(status: "Absent", location: "TSU San Isidro",date: '2026-07-07'),
          AttendanceItem(status: "Late", location: "TSU Main Campus",date: '2026-07-06'),
          AttendanceItem(status: "On-Time", location: "TSU San Isidro",date: '2026-07-05'),

        ],
      ),
    );
  }
}