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
  final VoidCallback requestBackgroundLocation;
  //Timer call back
  final VoidCallback timerStart;
  final VoidCallback timerReset;
  //Check if its runnning
  final bool isRunning;
  //status
  final VoidCallback statusActive;
  final VoidCallback statusInactive;
  // ask the server if we are already clocked in today (true = yes, and the timer was resumed)
  final Future<bool> Function() resync;
  //clockIn Out
  final SaveclockInOut clock = SaveclockInOut();

  Clockinbutton({
    super.key,
    required this.requestBackgroundLocation,
    required this.timerStart,
    required this.timerReset,
    required this.isRunning,
    required this.statusActive,
    required this.statusInactive,
    required this.resync,
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
            final bio = await biometric.authenticateUser();
            if (!bio.$1) {
              // say why, so a missing or failed fingerprint/face is not a silent nothing
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(bio.$2 ?? 'Biometric check failed. Please try again.'),
                ),
              );
              return;
            }
            if (bio.$1) {
              final success = await clock.clockIn();
              if (!success) {
                // "already clocked in today" is not a failure: pick the timer back up
                final alreadyIn = await resync();
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      alreadyIn
                          ? 'You are already clocked in today.'
                          : 'Failed to save attendance. Please try again.',
                    ),
                  ),
                );
                return;
              }
              timerStart();
              statusActive();
              // requestBackgroundLocation();
            }
          },

          child: Text(
            isRunning ? "Clock Out" : "Clock In",
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
