import 'package:flutter/material.dart';
// import 'package:flutter_biogeohr/main.dart';

// import '../Attendance/attendance.dart';
// import '../Attendance/monthly_attendance.dart';

import '../../../Controller/Login/logout.dart';

class ProfilePageMain extends StatelessWidget {
  final Logout logout = Logout();
  @override
  Widget build(BuildContext context) {
    var items = Container(
      padding: EdgeInsets.all(15),
      child: Center(
        child: Column(
          spacing: 5,
          children: [
            //Picture
            Container(
              width: 130,
              height: 130,
              decoration: ShapeDecoration(
                shape: CircleBorder(),
                color: Colors.red,
              ),
            ),
            //Name Section
            Container(
              child: Column(
                children: [
                  Text(
                    "Abdul Jackul Salsalani",
                    style: TextStyle(
                      color: Color(0xFF3A3A3A),
                      fontFamily: 'Roboto',
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    "Abdul0690@gmail.com",
                    style: TextStyle(
                      color: Color(0x803A3A3A),
                      fontFamily: 'Roboto',
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
            //Name Email

            //User Profile Clickable
            TextButton(
              style: TextButton.styleFrom(overlayColor: Colors.transparent),
              onPressed: () {},
              child: Container(
                child: Column(
                  spacing: 2,
                  children: [
                    Container(height: 1, width: 350, color: Color(0x803A3A3A)),
                    Row(
                      children: [
                        Icon(Icons.person, size: 50, color: Color(0xFF3A3A3A)),
                        Text(
                          ' User Profile',
                          style: TextStyle(
                            color: Color(0xFF3A3A3A),
                            fontFamily: 'Roboto',
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(height: 1, width: 350, color: Color(0x803A3A3A)),
                  ],
                ),
              ),
            ),

            //Change Password
            TextButton(
              style: TextButton.styleFrom(overlayColor: Colors.transparent),
              onPressed: () {},
              child: Container(
                child: Column(
                  spacing: 2,
                  children: [
                    Container(height: 1, width: 350, color: Color(0x803A3A3A)),
                    Row(
                      children: [
                        Icon(
                          Icons.lock_reset,
                          size: 50,
                          color: Color(0xFF3A3A3A),
                        ),
                        Text(
                          ' Change Password',
                          style: TextStyle(
                            color: Color(0xFF3A3A3A),
                            fontFamily: 'Roboto',
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(height: 1, width: 350, color: Color(0x803A3A3A)),
                  ],
                ),
              ),
            ),

            //log out
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  child: FilledButton(
                    onPressed: () {
                      Navigator.of(context).popUntil((route) => route.isFirst);
                      print(logout.logoutUser());
                    },
                    child: Text("Logout"),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
    return items;
  }
}
