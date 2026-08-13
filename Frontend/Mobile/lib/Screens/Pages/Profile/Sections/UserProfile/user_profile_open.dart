import 'package:flutter/material.dart';

class UserProfileOpen extends StatelessWidget {
  String name;
  String dateOfBirth;
  String gender;
  String nationality;
  String address;
  String contact;
  String email;

  UserProfileOpen({
    super.key,
    required this.name,
    required this.dateOfBirth,
    required this.gender,
    required this.nationality,
    required this.address,
    required this.contact,
    required this.email,
  });

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
                name,
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
                dateOfBirth,
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
                gender,
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
                nationality,
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
                address,
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
                contact,
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
                email,
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
