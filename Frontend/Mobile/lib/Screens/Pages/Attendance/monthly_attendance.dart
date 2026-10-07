import 'package:flutter/material.dart';

import '../../../Controller/Homepage/count_absent.dart';
import '../../../Controller/Homepage/count_late.dart';
import '../../../Controller/Homepage/count_on_time.dart';
import 'Items/absent.dart';
import 'Items/late.dart';
import 'Items/on_time.dart';

/// The three monthly counters at the top of the Attendance tab (on time / late / absent).
class MonthlyAttendance extends StatefulWidget {
  // optional loaders so the screen can be tested without a server
  final Future<int> Function()? loadOnTime;
  final Future<int> Function()? loadLate;
  final Future<int> Function()? loadAbsent;

  const MonthlyAttendance({
    super.key,
    this.loadOnTime,
    this.loadLate,
    this.loadAbsent,
  });

  @override
  State<MonthlyAttendance> createState() => _MonthlyAttendanceState();
}

class _MonthlyAttendanceState extends State<MonthlyAttendance> {
  int? onTimeDays; // null until loaded (shows "--"), stays null if the server fails
  int? lateDays;
  int? absentDays;

  @override
  void initState() {
    super.initState();
    _load();
  }

  // each counter loads on its own, so one failure does not blank the others
  void _load() {
    (widget.loadOnTime ?? CountOnTime().countOnTime)().then((v) {
      if (mounted) setState(() => onTimeDays = v);
    }).catchError((_) {});
    (widget.loadLate ?? CountLate().countLates)().then((v) {
      if (mounted) setState(() => lateDays = v);
    }).catchError((_) {});
    (widget.loadAbsent ?? CountAbsent().countAbsent)().then((v) {
      if (mounted) setState(() => absentDays = v);
    }).catchError((_) {});
  }

  Widget _card(Widget child) {
    return Container(
      height: 95,
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
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    // three Expanded cards share the width equally, on any phone size
    return Row(
      spacing: 12,
      children: [
        Expanded(child: _card(OnTime(days: onTimeDays))),
        Expanded(child: _card(Late(days: lateDays))),
        Expanded(child: _card(Absent(days: absentDays))),
      ],
    );
  }
}
