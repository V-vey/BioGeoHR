import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import '../Badge/attendance_badge.dart';

class AttendanceItem extends StatelessWidget {
  final String status;
  final String location;
  final String date;

  const AttendanceItem({
    super.key,
    required this.status,
    required this.location,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(7.5),
        color: Color(0xFFFCFCFC),
      ),
      child: Container(
        child: Column(
          children: [
            //Top Part
            Container(
              padding: EdgeInsets.only(top: 5, bottom: 5, right: 15, left: 15),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    child: Column(
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
                    //Location
                  ),
                  AttendanceBadge(
                    status: status,
                  ), // change the status to the flexible
                ],
              ),
            ),

            SizedBox(height: 5),
            Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
          ],
        ),
      ),
    );
  }
}
