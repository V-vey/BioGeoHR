import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Controller/Homepage/ClockIn/location_check.dart';
// import '../../../../../Service/GetLocation.dart';
import '../../../../../Service/AuthStorage.dart';
// import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../Controller/Homepage/ClockIn/biometric.dart';
// import 'Time.dart';
// import 'dart:async';

// import 'package:local_auth/local_auth.dart';

import '../../../../../Service/leave_balance.dart';

class Clockinbutton extends StatelessWidget {
  final AuthStorage authStorage = AuthStorage();
  final Biometric biometric = Biometric();

  final LeaveBalance balance = LeaveBalance();

  //Timer call back
  final VoidCallback timerStart;
  final VoidCallback timerReset;
  //Check if its runnning
  final bool isRunning;

  //status
  final VoidCallback statusActive;
  final VoidCallback statusInactive;
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
          onPressed: () async {
            //move this to leave balance

            //check if the timer is running
            if (isRunning == true) {
              timerReset();
              statusInactive();
            } else {
              //check if the user is in the coordinate
              if (await verifyUserCoordinates() == true) {
                //biometric check in the mobile:
                if (await biometric.authenticateUser() == (true, null)) {
                  timerStart();
                  statusActive();
                }
              } else {}
            }
          },

          child: Text("clock in"),
        ),
      ],
    );
  }
}
