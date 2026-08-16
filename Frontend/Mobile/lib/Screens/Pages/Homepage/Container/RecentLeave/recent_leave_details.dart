import 'package:flutter/material.dart';

class RecentLeaveItem extends StatelessWidget {
  const RecentLeaveItem({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        //line
        Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),

        //Starting Date and Ending Date
        Container(
          padding: EdgeInsets.only(top: 8, bottom: 8, right: 10, left: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              //Starting Date
              Row(
                children: [
                  Text(
                    'Start: ',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0x703A3A3A),
                    ),
                  ),

                  //Date Value
                  Text(
                    '2026-07-04',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0xFF3A3A3A),
                    ),
                  ),
                ],
              ),

              //Ending Date
              Row(
                children: [
                  Text(
                    'End: ',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0x703A3A3A),
                    ),
                  ),

                  //Value
                  Text(
                    '2026-07-05',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0xFF3A3A3A),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        //Date Submitted and Duration
        Container(
          padding: EdgeInsets.only(bottom: 8, right: 10, left: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              //Date Submitted
              Row(
                children: [
                  Text(
                    'Submitted: ',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0x703A3A3A),
                    ),
                  ),

                  //Date Value
                  Text(
                    '2026-07-03',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0xFF3A3A3A),
                    ),
                  ),
                ],
              ),

              //Duration
              Row(
                children: [
                  Text(
                    'Duration: ',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0x703A3A3A),
                    ),
                  ),

                  //Value
                  Text(
                    '1 Day',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0xFF3A3A3A),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        //line
        Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),

        Container(
          padding: EdgeInsets.only(top: 10, right: 10, left: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  //Verified Date
                  Text(
                    'Approved: ',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0x703A3A3A),
                    ),
                  ),

                  //Value
                  Text(
                    '2026-07-03',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0xFF3A3A3A),
                    ),
                  ),
                ],
              ),

              SizedBox(
                height: 25,
                width: 100,

                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    elevation: 0,
                    backgroundColor: Color(0xFF2AAF56),
                  ),
                  onPressed: () async {},

                  child: Text(
                    "View",
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
