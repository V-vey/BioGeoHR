import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_biogeohr/Controller/Homepage/ClockIn/location_check.dart';
// import '../../../../../Service/GetLocation.dart';
import '../../../../../Service/auth_storage.dart';
import '../../../../../Service/dialogs.dart';
// import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../Controller/Homepage/ClockIn/biometric.dart';
// import 'Time.dart';
// import 'dart:async';

// import 'package:local_auth/local_auth.dart';

import '../../../../../Controller/Homepage/leave_balance.dart';

import '../../../../../Controller/Homepage/ClockIn/save_attendance_clock_in.dart';

import '../../../../../Controller/Homepage/count_late.dart';
import 'package:geolocator/geolocator.dart';

const _offlineMessage =
    'Please check your internet connection and try again.';

/// True when the request never reached the server: airplane mode, no signal or a connection too weak.
bool _isOffline(Object e) =>
    e is SocketException || e is TimeoutException || e is http.ClientException;

/// The "are you sure?" pop-up before clocking in or out. true = go ahead.
/// It cannot be dismissed by tapping outside, so the employee has to pick a button.
Future<bool> _confirm(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
}) async {
  if (!context.mounted) return false;
  final ok = await showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (ctx) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return ok == true;
}

class Clockinbutton extends StatelessWidget {
  final AuthStorage authStorage = AuthStorage();
  final Biometric biometric = Biometric();

  final LeaveBalance balance = LeaveBalance();
  final CountLate late = CountLate();
  final VoidCallback requestBackgroundLocation;
  //Timer call back
  final Future<void> Function() timerStart;
  final VoidCallback timerPause; // clock-out: stop ticking, keep the time shown
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
    required this.timerPause,
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

            // 2. A small, even padding around the text, so the colour has room to show
            padding: EdgeInsets.symmetric(horizontal: 14, vertical: 6),

            // 3. Remove the built-in target interaction tap boundary box size
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,

            // red while clocked in (tap to clock out), green otherwise (tap to clock in)
            backgroundColor: isRunning ? Color(0xFFEC6668) : Color(0xFF2AAF56),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),

          onPressed: () async {
            //move this to leave balance
            late.countLates();

            //check if the timer is running
            if (isRunning) {
              // ask first: a stray tap would stop the clock
              if (!await _confirm(
                context,
                title: 'Clock out?',
                message:
                    'Your work time stops now. You can clock in again later today if you need to.',
                confirmLabel: 'Clock Out',
              )) {
                return;
              }
              timerPause();
              statusInactive();
              clock.clockOut();
              return;
            }

            // ask first, so a stray tap does not start the clock
            if (!await _confirm(
              context,
              title: 'Clock in?',
              message: 'Your work time starts now.',
              confirmLabel: 'Clock In',
            )) {
              return;
            }

            //check if in range
            try {
              if (!await verifyUserCoordinates()) {
                if (!context.mounted) return;
                await showError(
                  'You are outside the designated work area.',
                  title: 'Not in range',
                );
                return;
              }
            } catch (e) {
              if (!context.mounted) return;
              if (_isOffline(e)) {
                await showError(_offlineMessage, title: 'Connection error');
                return;
              }
              String message = 'Something went wrong getting your location.';

              if (e.toString().contains('Location services are disabled')) {
                message = 'Please turn on your GPS/Location to clock in.';
                clock.reportGpsOff(); // audit log; not awaited, so the pop-up shows at once
              } else if (e.toString().contains('permanently denied')) {
                message =
                    'Location permission is permanently denied. Please enable it in your phone settings.';
                await Geolocator.openAppSettings();
              } else if (e.toString().contains('denied')) {
                message = 'Location permission is required to clock in.';
              }

              await showError(message, title: "Can't clock in");
              return;
            }

            //the biometric
            final bio = await biometric.authenticateUser();
            if (!bio.$1) {
              // say why, so a missing or failed fingerprint/face is not a silent nothing
              clock.reportBiometricFailed(biometric.failureCode ?? 'failed'); // audit log; not awaited
              if (!context.mounted) return;
              await showError(
                bio.$2 ?? 'Biometric check failed. Please try again.',
                title: 'Verification failed',
              );
              return;
            }
            if (bio.$1) {
              bool success;
              try {
                success = await clock.clockIn();
              } catch (e) {
                // no signal, airplane mode or a very weak connection: nothing was saved
                if (!context.mounted) return;
                await showError(
                  _isOffline(e)
                      ? _offlineMessage
                      : 'Failed to save attendance. Please try again.',
                  title: _isOffline(e)
                      ? 'Connection error'
                      : "Couldn't save attendance",
                );
                return;
              }
              if (!success) {
                // "already clocked in" is not a failure: pick the timer back up
                final alreadyIn = await resync();
                if (!context.mounted) return;
                if (alreadyIn) {
                  await showWarning(
                    'You are already clocked in.',
                    title: 'Already clocked in',
                  );
                } else {
                  await showError(
                    'Failed to save attendance. Please try again.',
                    title: "Couldn't save attendance",
                  );
                }
                return;
              }
              await timerStart();
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
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}
