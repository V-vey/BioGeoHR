import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../Controller/Attendance/attendance_model.dart';
import '../../../Controller/Attendance/attendance_controller.dart';
import '../../../Controller/Attendance/work_duration.dart';
import '../../Reusable/Items/attendance_item_layout.dart';
import 'Items/atttendance_pages.dart';
import 'monthly_attendance.dart';

class AttendancePageMain extends StatefulWidget {
  // optional loaders so the screen can be tested without a server
  // (page, date): date null = every day
  final Future<AttendancePage> Function(int page, DateTime? date)? loader;
  final Future<int> Function()? loadOnTime;
  final Future<int> Function()? loadLate;
  final Future<int> Function()? loadAbsent;
  final DateTime Function()? today; // for tests; the phone's date otherwise

  const AttendancePageMain({
    super.key,
    this.loader,
    this.loadOnTime,
    this.loadLate,
    this.loadAbsent,
    this.today,
  });

  @override
  State<AttendancePageMain> createState() => _AttendancePageMainState();
}

class _AttendancePageMainState extends State<AttendancePageMain> {
  // the day shown; it starts on today, and null means every day
  late DateTime? _day = _today();

  // today on this phone, without the time of day
  DateTime _today() {
    final now = (widget.today ?? DateTime.now)();
    return DateTime(now.year, now.month, now.day);
  }

  // Only one page is ever downloaded; the arrows ask the server for the next one. It must be
  // assigned before the first build, or the screen crashes.
  late Future<AttendancePage> _records = _fetch(1);

  Future<AttendancePage> _fetch(int page) async {
    final date = _day;
    final loaded = await (widget.loader != null
        ? widget.loader!(page, date)
        : AttendanceController().getAttendancePage(page, date: date));
    // one chosen day: show its in / out times straight away
    if (date != null) {
      _opened
        ..clear()
        ..addAll(List.generate(loaded.records.length, (i) => i));
    }
    return loaded;
  }

  // which rows are opened (tap a row to show the clock in / out times)
  final Set<int> _opened = {};

  void _setDate(DateTime? date) {
    setState(() {
      _day = date;
      _opened.clear();
      _records = _fetch(1);
    });
  }

  Future<void> _pickDate() async {
    final today = _today();
    final picked = await showDatePicker(
      context: context,
      initialDate: _day ?? today,
      firstDate: DateTime(2020),
      lastDate: today, // attendance cannot be in the future
    );
    if (picked != null) _setDate(DateTime(picked.year, picked.month, picked.day));
  }

  // the date chip, and "Today" / "All dates" to get back to the usual views
  Widget _filterBar() {
    final today = _today();
    final date = _day;
    final isToday =
        date != null &&
        date.year == today.year &&
        date.month == today.month &&
        date.day == today.day;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Wrap(
        spacing: 8,
        runSpacing: 2,
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          OutlinedButton.icon(
            onPressed: _pickDate,
            icon: const Icon(Icons.calendar_today, size: 16),
            label: Text(
              date == null ? 'All dates' : DateFormat('MMM d, yyyy').format(date),
            ),
          ),
          if (!isToday)
            TextButton(onPressed: () => _setDate(today), child: const Text('Today')),
          if (date != null)
            TextButton(
              onPressed: () => _setDate(null),
              child: const Text('All dates'),
            ),
        ],
      ),
    );
  }

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
              'Attendance',
              style: TextStyle(
                fontFamily: 'Roboto',
                color: Color(0xFF6675EC),
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          _filterBar(),
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

            FutureBuilder<AttendancePage>(
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
                  return _card(
                    Column(
                      children: [
                        _message('Could not load your attendance'),
                        TextButton(
                          onPressed: () => setState(() {
                            _opened.clear();
                            _records = _fetch(1);
                          }),
                          child: const Text('Try again'),
                        ),
                      ],
                    ),
                  );
                }

                // this page's records, already newest day first
                final data = snapshot.data!;
                final records = data.records;

                // nothing recorded (on the chosen day, or at all)
                if (data.total == 0 && records.isEmpty) {
                  final date = _day;
                  return _card(
                    _message(
                      date == null
                          ? 'No attendance yet'
                          : 'No attendance on ${DateFormat('MMM d, yyyy').format(date)}',
                    ),
                  );
                }

                return _card(
                  Column(
                    spacing: 5,
                    children: [
                      for (var i = 0; i < records.length; i++)
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
                            duration: workDuration(
                              records[i].clockIn,
                              records[i].clockOut,
                              date: records[i].date,
                              workedSeconds: records[i].workedSeconds,
                            ),
                          ),
                        ),
                      // the pager only matters when there is more than one page
                      if (data.lastPage > 1) ...[
                        Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
                        AttendancePages(
                          pageNum: data.page,
                          totalPages: data.lastPage,
                          onPageChanged: (newPage) {
                            setState(() {
                              _opened.clear();
                              _records = _fetch(newPage);
                            });
                          },
                        ),
                      ],
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
