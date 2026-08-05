import 'package:flutter/material.dart';
import 'change_password_open.dart';

class ChangePassword extends StatefulWidget {
  const ChangePassword({super.key});

  @override
  State<ChangePassword> createState() => _ChangePasswordState();
}

bool isVisible = false;

class _ChangePasswordState extends State<ChangePassword> {
  @override
  Widget build(BuildContext context) {
    var items = GestureDetector(
      onTap: () {
        setState(() {
          isVisible = !isVisible;
        });
      },
      child: Container(
        width: 350,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Color(0xFFFCFCFC),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(20),
              blurRadius: 6.0,
              spreadRadius: 4.0,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Icon(Icons.lock_reset, size: 30),
                SizedBox(width: 10),
                Text(
                  "Change Password",
                  style: TextStyle(
                    color: Color(0xFF3A3A3A),
                    fontFamily: 'Roboto',
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Spacer(),

                Icon(Icons.chevron_right, size: 30),
              ],
            ),

            if (isVisible) ...[
              SizedBox(height: 5),
              Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
              ChangePasswordOpen(),
            ],
          ],
        ),
      ),
    );
    return items;
  }
}
