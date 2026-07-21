import 'package:flutter/material.dart';

class RecentAttendanceDetails extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return 
    Container(
      child: Column(
        children: [
          Container(
            width: 350,
            height: 1,
            color: Color(0xFFE0E0E0)
          ),
          //Date and Clock in
          Container(
            padding: EdgeInsets.only(top: 8, bottom: 8, right: 10, left: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                //Date
                Container(
                  child: Row(
                    children: [
                      Text('Date: ',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          color: Color(0x703A3A3A),
                        ),
                      ),

                      //Date Value
                      Text('April 7, 2026',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          color: Color(0xFF3A3A3A),
                        ),
                      )
                    ],
                  )
                ),

                //Clock in
                Container(
                  child: Row(
                    children: [
                      Text('Clock In: ',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          color: Color(0x703A3A3A),
                        ),
                      ),

                      //Value
                      Text('7:00 AM',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          color: Color(0xFF3A3A3A),
                        ),
                      )
                    ],
                  )
                ),

              ],)
            ),

            //Duration and Clock out
            Container(
              padding: EdgeInsets.only(bottom: 5, right: 10, left: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                
                //Duration
                Container(
                  child: Row(
                    children: [
                      Text('Duration: ',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          color: Color(0x703A3A3A),
                        ),
                      ),

                      //Date Value
                      Text('8 Hours',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          color: Color(0xFF3A3A3A),
                        ),
                  )
                ],
              )
            ),

             //Clock out
            Container(
              child: Row(
                children: [
                  Text('Clock Out: ',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0x703A3A3A),
                    ),
                  ),

                      //Value
                  Text('3:00 PM',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      color: Color(0xFF3A3A3A),
                    ),
                  )
                ],
              )
            ),
          ],)
        )
      ])
    );
  }
}