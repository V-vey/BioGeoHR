import 'package:flutter/material.dart';

import 'leave_balance_item.dart';

class LeaveBalance extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 167,
      height: 155,
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
        children: [
          Container(
            padding: EdgeInsets.all(5),
            child: Text(
              'Leave',
              style: TextStyle(
                fontFamily: 'Roboto',
                color: Color(0xFF6675EC),
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(height: 1, width: 167, color: Color(0xFFE0E0E0)),
          LeaveBalanceItem(),
        ],
      ),
    );
  }
}
