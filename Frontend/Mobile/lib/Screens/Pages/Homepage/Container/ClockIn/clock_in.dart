// import 'package:flutter/widgets.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import '../../../../Reusable/Badge/time_badge.dart';
import '../../../../../Service/GetLocation.dart';
import 'time.dart';
import 'location_list.dart';
import 'clock_in_button.dart';
//testing
import '../../../../../Service/leave_balance.dart';

class ClockIn extends StatefulWidget {
  const ClockIn({super.key});

  @override
  State<ClockIn> createState() => _ClockInState();
}

class _ClockInState extends State<ClockIn> {
  final LeaveBalance bal = LeaveBalance();

  final GetLocation location = GetLocation();

  //TIMER
  Duration duration = Duration();
  Timer? timer;
  bool isRunning = false;

  void addTimer() {
    setState(() {
      final seconds = duration.inSeconds + 1;

      duration = Duration(seconds: seconds);
    });
  }

  //call to start
  void start() {
    if (isRunning == true) return;

    isRunning = true;
    timer = Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() {
        addTimer();
      });
    });
  }

  //call to Reset
  void reset() {
    setState(() {
      isRunning = false;
      duration = Duration();
      timer?.cancel();
    });
  }

  @override
  void dispose() {
    timer?.cancel(); // Always clean up your timer to prevent memory leaks
    super.dispose();
  }

  //timer text format
  String timerText() {
    // Format DIGITS
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    final hrs = twoDigits(duration.inHours);
    final min = twoDigits(duration.inMinutes.remainder(60));
    final sec = twoDigits(duration.inSeconds.remainder(60));
    return "$hrs:$min:$sec";
  }

  //STATUS
  String status = "Inactive";
  void setStatusActive() {
    setState(() {
      status = 'Active';
    });
  }

  void setStatusInactive() {
    setState(() {
      status = 'Inactive';
    });
  }

  @override
  Widget build(BuildContext context) {
    //for the timer to global call function
    return Container(
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
      padding: EdgeInsets.all(10),
      child: Column(
        children: [
          Row(
            children: [
              TimeBadge(status: status),
              Spacer(),
              LocationList(),
            ],
          ),
          //timer and button for callback start
          Row(
            children: [
              Time(timerText: timerText()),
              Spacer(),
              Clockinbutton(
                timerStart: start,
                timerReset: reset,
                isRunning: isRunning,
                statusActive: setStatusActive,
                statusInactive: setStatusInactive,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
