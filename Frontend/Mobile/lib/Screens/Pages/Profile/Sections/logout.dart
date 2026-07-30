import 'package:flutter/material.dart';
import '../../../../Controller/Login/logout.dart';

class LogoutButton extends StatelessWidget {
  final Logout logout = Logout();

  @override
  Widget build(BuildContext context) {
    var items = FilledButton(
      onPressed: () {
        Navigator.of(context).popUntil((route) => route.isFirst);
      },
      child: Text("Logout"),
    );
    return items;
  }
}
