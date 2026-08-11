import 'package:flutter/material.dart';

class AccountDetailsOpen extends StatelessWidget {
  const AccountDetailsOpen({super.key});

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
                "Account Created:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "December 26, 2024",
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
                "Last Login: ",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "December 28, 2026",
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
                "Account Status:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                "Employee",
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
