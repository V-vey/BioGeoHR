import 'package:flutter/material.dart';

import '../../Reusable/Items/LeaveItem.dart';

class LeaveHistory extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      height: 455,
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
            'Leave Request',
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
          LeaveItem(status: "Pending", type: "Sick Leave" ,date: '2026-07-08'),
          LeaveItem(status: "Approved", type: "Patternity Leave" ,date: '2026-07-08'),
          LeaveItem(status: "Reject", type: "Unpaid Leave" ,date: '2026-07-08'),
          LeaveItem(status: "Approved", type: "Annual Leave" ,date: '2026-07-08'),
          LeaveItem(status: "Pending", type: "Sick Leave" ,date: '2026-07-08'),

        ],
      ),
    );
  }
}