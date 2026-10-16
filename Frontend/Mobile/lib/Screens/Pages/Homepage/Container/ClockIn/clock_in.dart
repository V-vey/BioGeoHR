// import 'package:flutter/widgets.dart';
import 'package:flutter/material.dart';
import 'dart:async';
import '../../../../Reusable/Badge/time_badge.dart';
import '../../../../../Controller/Homepage/ClockIn/get_location.dart';
import 'time.dart';
import 'location_list.dart';
import 'clock_in_button.dart';
import '../../../../../Controller/Homepage/ClockIn/geofence_periodic_check.dart';
import '../../../../../Controller/Homepage/ClockIn/today_attendance.dart';
//testing
import '../../../../../Controller/Homepage/leave_balance.dart';

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../Service/url.dart';
import 'package:http/http.dart' as http;

import 'package:workmanager/workmanager.dart';
import 'package:geolocator/geolocator.dart';

class ClockIn extends StatefulWidget {
  const ClockIn({super.key});

  @override
  State<ClockIn> createState() => _ClockInState();
}

class _ClockInState extends State<ClockIn> {
  //with AutomaticKeepAliveClientMixin and bool get wantKeepAlive will make it run
  // bool get wantKeepAlive => true;
  final LeaveBalance bal = LeaveBalance();

  final GetLocation location = GetLocation();

  //TIMER
  Duration duration = Duration();
  Timer? timer;
  bool isRunning = false;

  Timer? geofenceTimer;

  final Url _api = Url();
  int geofenceIntervalMinutes = 30; // fallback default

  Future<void> fetchGeofenceInterval() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString("token");

      final response = await http.get(
        Uri.parse(_api.systemSettings()),
        headers: {
          "Authorization": "Bearer $token",
          "Accept": "application/json",
        },
      );
      final data = jsonDecode(response.body);
      setState(() {
        geofenceIntervalMinutes = data['geofence_check_interval_minutes'];
      });
    } catch (e) {
      // keep the fallback default on failure
    }
  }

  Future<void> requestBackgroundLocation() async {
    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.whileInUse) {
      permission = await Geolocator.requestPermission();
    }

    if (permission != LocationPermission.always) {
      // Android wouldn't grant it via a simple dialog — user must enable it manually
      await Geolocator.openAppSettings();
    }
  }

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await fetchGeofenceInterval(); // start() needs the interval
    await resync();
  }

  /// Ask the server whether the employee is clocked in today, and make the timer match.
  /// The timer shows everything worked today (all sessions added up), so after a clock-out it
  /// stays at that number, paused, and carries on from it when the employee clocks in again.
  /// This is what brings the clock back after the app was closed, restarted or logged
  /// out and in again. Returns true when they are clocked in and not clocked out.
  Future<bool> resync() async {
    try {
      final today = await GetTodayAttendance().get();
      if (!mounted) return false;

      if (today == null) {
        // nothing clocked today: a new day starts from zero
        if (isRunning) reset();
        setState(() {
          duration = Duration();
          status = 'Inactive';
        });
        return false;
      }

      final total = Duration(seconds: today.workedSeconds); // the server's count
      if (today.running) {
        setState(() {
          duration = total;
          status = 'Active';
        });
        start(askLocation: false); // no-op if the timer is already running
        return true;
      }
      // clocked out today: paused, showing what was worked so far
      if (isRunning) pause();
      setState(() {
        duration = total;
        status = 'Inactive';
      });
      return false;
    } catch (e) {
      return false; // no connection: leave the clock as it is
    }
  }

  /// Clock-in succeeded: take the day's total from the server first (so a second clock-in
  /// carries on from the earlier sessions, and a new day starts from zero), then tick.
  Future<void> startAfterClockIn() async {
    try {
      final today = await GetTodayAttendance().get();
      if (mounted && today != null) {
        setState(() => duration = Duration(seconds: today.workedSeconds));
      }
    } catch (e) {
      // no connection: carry on from the number on screen
    }
    if (mounted) start();
  }

  void start({bool askLocation = true}) {
    if (isRunning == true) return;
    isRunning = true;
    // when resuming after a restart the permission was already handled, so do not
    // send the employee to the settings screen again
    if (askLocation) requestBackgroundLocation();
    Workmanager().registerPeriodicTask(
      "geofence-check",
      "geofenceCheckTask",
      frequency: Duration(minutes: geofenceIntervalMinutes),
    );
    timer = Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() => addTimer());
    });

    //change min to 30 later or the data
    geofenceTimer = Timer.periodic(Duration(minutes: geofenceIntervalMinutes), (
      timer,
    ) {
      checkGeofencePeriodically();
    });
  }

  /// Stop the clock and the location checks but keep the time on screen (clock-out).
  void pause() {
    Workmanager().cancelByUniqueName("geofence-check");
    setState(() {
      isRunning = false;
      timer?.cancel();
      geofenceTimer?.cancel();
    });
  }

  /// Stop the clock and go back to zero (a new day, or nothing clocked in).
  void reset() {
    Workmanager().cancelByUniqueName("geofence-check");
    setState(() {
      isRunning = false;
      duration = Duration();
      timer?.cancel();
      geofenceTimer?.cancel();
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    geofenceTimer?.cancel();
    super.dispose();
  }

  void addTimer() {
    setState(() {
      final seconds = duration.inSeconds + 1;

      duration = Duration(seconds: seconds);
    });
  }

  // //call to start
  // void start() {
  //   if (isRunning == true) return;

  //   isRunning = true;
  //   timer = Timer.periodic(Duration(seconds: 1), (timer) {
  //     setState(() {
  //       addTimer();
  //     });
  //   });
  // }

  // //call to Reset
  // void reset() {
  //   setState(() {
  //     isRunning = false;
  //     duration = Duration();
  //     timer?.cancel();
  //   });
  // }

  // @override
  // void dispose() {
  //   timer?.cancel(); // Always clean up your timer to prevent memory leaks
  //   super.dispose();
  // }

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
    // super.build(context);
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

      padding: EdgeInsets.symmetric(horizontal: 15, vertical: 15),
      child: Column(
        spacing: 10,
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
                timerStart: startAfterClockIn,
                requestBackgroundLocation: requestBackgroundLocation,
                timerPause: pause,
                isRunning: isRunning,
                statusActive: setStatusActive,
                statusInactive: setStatusInactive,
                resync: resync,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
