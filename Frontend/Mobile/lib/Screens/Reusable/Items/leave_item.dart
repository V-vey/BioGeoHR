import 'package:flutter/material.dart';
import '../Badge/leave_badge.dart';

class LeaveItem extends StatelessWidget {
  final String status;
  final String type;
  final String date;
  final String? remarks; // HR's remarks on a decided leave; hidden when empty

  const LeaveItem({
    super.key,
    required this.status,
    required this.type,
    required this.date,
    this.remarks,
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
                      type,
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
                LeaveBadge(status: status), // change the status to the flexible
              ],
            ),
          ),

          if (remarks != null && remarks!.trim().isNotEmpty)
            Container(
              width: double.infinity,
              padding: EdgeInsets.only(left: 15, right: 15, bottom: 4),
              child: Text(
                'HR remarks: $remarks',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  fontSize: 12,
                  color: Color(0x803A3A3A),
                ),
              ),
            ),
          SizedBox(height: 5),
          Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
        ],
      ),
    );
  }
}
