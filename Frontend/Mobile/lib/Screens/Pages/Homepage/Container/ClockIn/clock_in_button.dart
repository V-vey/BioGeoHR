import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Controller/Homepage/ClockIn/location_check.dart';
// import '../../../../../Service/GetLocation.dart';
import '../../../../../Service/auth_storage.dart';
// import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../Controller/Homepage/ClockIn/biometric.dart';
// import 'Time.dart';
// import 'dart:async';

// import 'package:local_auth/local_auth.dart';

import '../../../../../Controller/Homepage/leave_balance.dart';

import '../../../../../Controller/Homepage/ClockIn/save_attendance_clock_in.dart';

import '../../../../../Controller/Homepage/count_late.dart';
import 'package:geolocator/geolocator.dart';

class Clockinbutton extends StatelessWidget {
  final AuthStorage authStorage = AuthStorage();
  final Biometric biometric = Biometric();

  final LeaveBalance balance = LeaveBalance();
  final CountLate late = CountLate();

  //Timer call back
  final VoidCallback timerStart;
  final VoidCallback timerReset;
  //Check if its runnning
  final bool isRunning;

  //status
  final VoidCallback statusActive;
  final VoidCallback statusInactive;

  //clockIn Out
  final SaveclockInOut clock = SaveclockInOut();

  Clockinbutton({
    super.key,
    required this.timerStart,
    required this.timerReset,
    required this.isRunning,
    required this.statusActive,
    required this.statusInactive,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextButton(
          style: TextButton.styleFrom(
            // 1. Remove the standard 48.0 minimum height constraint
            minimumSize: Size.zero,

            // 2. Clear out all the default internal text padding
            padding: EdgeInsets.zero,

            // 3. Remove the built-in target interaction tap boundary box size
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),

          onPressed: () async {
            //move this to leave balance
            late.countLates();

            //check if the timer is running
            if (isRunning) {
              timerReset();
              statusInactive();

              clock.clockOut();
              return;
            }

            //check if in range
            try {
              if (!await verifyUserCoordinates()) {
                if (!context.mounted) return;
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text('User Not In Range')));
                return;
              }
            } catch (e) {
              if (!context.mounted) return;
              String message = 'Something went wrong getting your location.';

              if (e.toString().contains('Location services are disabled')) {
                message = 'Please turn on your GPS/Location to clock in.';
              } else if (e.toString().contains('permanently denied')) {
                message =
                    'Location permission is permanently denied. Please enable it in your phone settings.';
                await Geolocator.openAppSettings();
              } else if (e.toString().contains('denied')) {
                message = 'Location permission is required to clock in.';
              }

              ScaffoldMessenger.of(
                context,
              ).showSnackBar(SnackBar(content: Text(message)));
              return;
            }

            //the biometric
            if (await biometric.authenticateUser() == (true, null)) {
              timerStart();
              statusActive();

              clock.clockIn();
            }
          },

          child: Text(
            "clock in  ",
            style: TextStyle(
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF3A3A3A),
            ),
          ),
        ),
      ],
    );
  }
}
