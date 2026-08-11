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
          Row(
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
              Spacer(),
              Text(
                "Abdul Jackul Salsalani",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Date of Birth:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "December 28, 2004",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Gender:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "Male",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Nationality:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "Filipino",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Address:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "2302 Rizal, Gerona, Tarlac",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Phone Number:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "09617989697",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Email:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "harveytayag122804@gmail.com",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
