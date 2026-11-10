import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../Controller/Homepage/ClockIn/today_attendance.dart';
import '../../../../Controller/Login/logout.dart';
import '../../../../Service/dialogs.dart';

class LogoutButton extends StatefulWidget {
  const LogoutButton({super.key});

  @override
  State<LogoutButton> createState() => _LogoutButtonState();
}

class _LogoutButtonState extends State<LogoutButton> {
  final Logout logout = Logout();
  bool _busy = false; // a second tap cannot start a second logout

  Future<void> _logout() async {
    setState(() => _busy = true);
    try {
      // logging out stops the location checks, so a clocked-in employee must clock out first
      final TodayAttendance? today;
      try {
        today = await GetTodayAttendance().get().timeout(const Duration(seconds: 15));
      } catch (e) {
        // an expired session was already sent back to the login screen by the session client
        final prefs = await SharedPreferences.getInstance();
        if (prefs.getString('token') == null) return;
        await showError(
          'Please check your internet connection and try again.',
          title: 'Connection error',
        );
        return;
      }
      if (today?.running == true) {
        await showWarning(
          'Clock out first before logging out.',
          title: 'Still clocked in',
        );
        return;
      }

      if (!mounted) return;
      final sure = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          title: const Text('Log out?'),
          content: const Text('You will need to log in again to use the app.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Log Out'),
            ),
          ],
        ),
      );
      if (sure != true) return;

      await logout.logoutUser();
      if (!mounted) return;
      Navigator.of(context).popUntil((route) => route.isFirst);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: _busy ? null : _logout,
      child: const Text("Logout"),
    );
  }
}
