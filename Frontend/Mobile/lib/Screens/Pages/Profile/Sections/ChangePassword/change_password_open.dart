import 'package:flutter/material.dart';

class ChangePasswordOpen extends StatelessWidget {
  const ChangePasswordOpen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextFormField(
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Current Password',
            border: OutlineInputBorder(),
          ),
        ),
      ],
    );
  }
}
