import 'package:flutter/material.dart';

class UserProfileOpen extends StatelessWidget {
  const UserProfileOpen({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      padding: EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 5,
        children: [
          Text(
            "Full Name:",
            style: TextStyle(
              color: Color(0xBF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.normal,
            ),
          ),
          Text(
            "Date of Birth:",
            style: TextStyle(
              color: Color(0xBF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.normal,
            ),
          ),
          Text(
            "Gender:",
            style: TextStyle(
              color: Color(0xBF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.normal,
            ),
          ),
          Text(
            "Nationality:",
            style: TextStyle(
              color: Color(0xBF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.normal,
            ),
          ),
          Text(
            "Address:",
            style: TextStyle(
              color: Color(0xBF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.normal,
            ),
          ),
          Text(
            "Phone Number:",
            style: TextStyle(
              color: Color(0xBF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.normal,
            ),
          ),
          Text(
            "Email:",
            style: TextStyle(
              color: Color(0xBF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.normal,
            ),
          ),
          ElevatedButton(onPressed: () {}, child: Text("Save")),
        ],
      ),
    );
  }
}
