import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../Controller/Attendance/attendance_model.dart';
import '../../../Controller/Attendance/attendance_controller.dart';
import '../../Reusable/Items/attendance_item_layout.dart';
import 'Items/atttendance_pages.dart';
import 'monthly_attendance.dart';

class AttendancePageMain extends StatefulWidget {
  // optional loaders so the screen can be tested without a server
  final Future<List<AttendanceModel>> Function()? loader;
  final Future<int> Function()? loadOnTime;
  final Future<int> Function()? loadLate;
  final Future<int> Function()? loadAbsent;

  const AttendancePageMain({
    super.key,
    this.loader,
    this.loadOnTime,
    this.loadLate,
    this.loadAbsent,
  });

  @override
  State<AttendancePageMain> createState() => _AttendancePageMainState();
}

class _AttendancePageMainState extends State<AttendancePageMain> {
  // loaded once; it must be assigned before the first build, or the screen crashes
  late final Future<List<AttendanceModel>> _records =
      (widget.loader ?? AttendanceController().getAttendance)();

  // Track the active page state
  int _currentPage = 1;
  final int _itemsPerPage = 7;

  // which rows are opened (tap a row to show the clock in / out times)
  final Set<int> _opened = {};

  // "08:21:00" -> "8:21 AM"; anything else ("--:--") is shown as it is
  String _time(String t) {
    try {
      return DateFormat('h:mm a').format(DateFormat('HH:mm:ss').parse(t));
    } catch (_) {
      return t;
    }
  }

  // "2026-10-05" -> "Oct 5, 2026"
  String _date(String d) {
    try {
      return DateFormat('MMM d, yyyy').format(DateTime.parse(d));
    } catch (_) {
      return d;
    }
  }

  // the "All Attendance" card; only its body changes between loading / error / empty / list
  Widget _card(Widget body) {
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
      child: Column(
        spacing: 5,
        children: [
          SizedBox(),
          Container(
            padding: EdgeInsets.all(5),
            child: Text(
              'All Attendance',
              style: TextStyle(
                fontFamily: 'Roboto',
                color: Color(0xFF6675EC),
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          //line
          Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
          body,
        ],
      ),
    );
  }

  Widget _message(String text) => Padding(
    padding: const EdgeInsets.all(20),
    child: Text(text, style: const TextStyle(color: Colors.grey)),
  );

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        margin: EdgeInsets.all(15),
        child: Column(
          children: [
            //Top part the monthly attendance num
            MonthlyAttendance(
              loadOnTime: widget.loadOnTime,
              loadLate: widget.loadLate,
              loadAbsent: widget.loadAbsent,
            ),
            //spacing
            SizedBox(height: 15),

            FutureBuilder<List<AttendanceModel>>(
              future: _records,
              builder: (context, snapshot) {
                // loader while waiting for the backend
                if (snapshot.connectionState != ConnectionState.done) {
                  return _card(
                    const Padding(
                      padding: EdgeInsets.all(20),
                      child: SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ),
                  );
                }

                // the request failed
                if (snapshot.hasError) {
                  return _card(_message('Could not load your attendance'));
                }

                // newest day first
                final records = [...(snapshot.data ?? <AttendanceModel>[])]
                  ..sort((a, b) => b.date.compareTo(a.date));

                // nothing recorded yet
                if (records.isEmpty) {
                  return _card(_message('No attendance yet'));
                }

                // Calculate the slice of 7 records to show for the current page
                final int totalPages = (records.length / _itemsPerPage).ceil();
                final int page = _currentPage > totalPages
                    ? totalPages
                    : _currentPage;
                final int startIndex = (page - 1) * _itemsPerPage;
                final int endIndex = startIndex + _itemsPerPage > records.length
                    ? records.length
                    : startIndex + _itemsPerPage;

                return _card(
                  Column(
                    spacing: 5,
                    children: [
                      for (var i = startIndex; i < endIndex; i++)
                        GestureDetector(
                          onTap: () => setState(() {
                            _opened.contains(i)
                                ? _opened.remove(i)
                                : _opened.add(i);
                          }),
                          child: AttendanceItemLayout(
                            status: records[i].status,
                            location: records[i].location,
                            date: _date(records[i].date),
                            isVisible: _opened.contains(i),
                            clockIn: _time(records[i].clockIn),
                            clockOut: _time(records[i].clockOut),
                          ),
                        ),
                      Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
                      AttendancePages(
                        pageNum: page,
                        totalPages: totalPages,
                        onPageChanged: (newPage) {
                          setState(() {
                            _currentPage = newPage;
                            _opened.clear();
                          });
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
