import 'package:flutter/material.dart';
import 'change_password_open.dart';

class ChangePassword extends StatefulWidget {
  const ChangePassword({super.key});

  @override
  State<ChangePassword> createState() => _ChangePasswordState();
}

bool isVisible = false;
IconData icon = Icons.chevron_right;

class _ChangePasswordState extends State<ChangePassword> {
  final TextEditingController _currentPassword = TextEditingController();
  final TextEditingController _newPassword = TextEditingController();
  final TextEditingController _reTypePassword = TextEditingController();
  @override
  Widget build(BuildContext context) {
    var items = Stack(
      children: [
        Container(
          width: 350,
          padding: EdgeInsets.all(10),
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
                  Icon(Icons.person, size: 30),
                  SizedBox(width: 10),
                  Text(
                    "Personal Details",
                    style: TextStyle(
                      color: Color(0xFF3A3A3A),
                      fontFamily: 'Roboto',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Spacer(),

                  Icon(icon),
                ],
              ),
              if (isVisible) ...[
                SizedBox(height: 5),
                Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
                SizedBox(height: 10),
                ChangePasswordOpen(
                  currentPassword: _currentPassword,
                  newPassword: _newPassword,
                  reTypePassword: _reTypePassword,
                ),
              ],
            ],
          ),
        ),

        //clikable Container to open
        GestureDetector(
          onTap: () {
            setState(() {
              isVisible = !isVisible;
              icon = isVisible ? Icons.expand_more : Icons.chevron_right;
            });
          },
          child: Container(width: 350, height: 50, color: Color(0x00000000)),
        ),
      ],
    );
    return items;
  }
}
