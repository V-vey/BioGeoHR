import 'package:flutter/material.dart';

class AccountDetailsOpen extends StatelessWidget {
  final String createdAt;
  final String updatedAt;
  final String lastLogin;
  final String accountStatus;
  const AccountDetailsOpen({
    super.key,
    required this.createdAt,
    required this.updatedAt,
    required this.lastLogin,
    required this.accountStatus,
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
                createdAt,
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
                "Account Updated: ",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                updatedAt,
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
                lastLogin,
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
                accountStatus,
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
