import 'package:flutter/material.dart';

import '../../../Controller/Homepage/my_leave.dart';
import '../Attendance/Items/atttendance_pages.dart';
import 'leave_detail.dart';
import 'leave_history_item.dart';

/// The "Leave History" card on the Leave tab: every leave request of the employee,
/// newest first, a few per page with "Page 1 of N" and < > under the list (like the
/// Attendance tab), each row with a View button.
class LeaveHistory extends StatefulWidget {
  // optional loader so the card can be tested without a server
  final Future<List<LeaveRequestData>> Function()? loader;
  // called after a request was cancelled, so the tab reloads this list
  final VoidCallback? onChanged;

  const LeaveHistory({super.key, this.loader, this.onChanged});

  @override
  State<LeaveHistory> createState() => _LeaveHistoryState();
}

class _LeaveHistoryState extends State<LeaveHistory> {
  // loaded once (creating the Future inside build would call the server on every rebuild)
  late final Future<List<LeaveRequestData>> _leaves =
      (widget.loader ?? MyLeave().getAll)();

  // which page is shown
  int _currentPage = 1;
  final int _itemsPerPage = 5;

  // loading / error / empty: a fixed-height box, so the card does not jump around
  Widget _message(Widget child) => SizedBox(height: 150, child: Center(child: child));

  Widget _text(String text) => Padding(
    padding: const EdgeInsets.all(20),
    child: Text(text, style: const TextStyle(color: Colors.grey)),
  );

  Future<void> _view(LeaveRequestData leave) async {
    final changed = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => LeaveDetailPage(leave: leave)),
    );
    if (changed == true) widget.onChanged?.call(); // it was cancelled
  }

  @override
  Widget build(BuildContext context) {
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
              'Leave History',
              style: TextStyle(
                fontFamily: 'Roboto',
                color: Color(0xFF6675EC),
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
          FutureBuilder<List<LeaveRequestData>>(
            future: _leaves,
            builder: (context, snap) {
              if (snap.connectionState != ConnectionState.done) {
                return _message(
                  const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              }
              if (snap.hasError) {
                return _message(_text('Could not load your leave requests'));
              }

              final leaves = snap.data ?? <LeaveRequestData>[];
              if (leaves.isEmpty) return _message(_text('No leave requests yet'));

              // the slice of requests for the current page
              final int totalPages = (leaves.length / _itemsPerPage).ceil();
              final int page = _currentPage > totalPages ? totalPages : _currentPage;
              final int startIndex = (page - 1) * _itemsPerPage;
              final int endIndex = startIndex + _itemsPerPage > leaves.length
                  ? leaves.length
                  : startIndex + _itemsPerPage;

              return Column(
                spacing: 5,
                children: [
                  for (var i = startIndex; i < endIndex; i++)
                    LeaveHistoryItem(
                      leave: leaves[i],
                      onView: () => _view(leaves[i]),
                    ),
                  Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
                  AttendancePages(
                    pageNum: page,
                    totalPages: totalPages,
                    onPageChanged: (newPage) {
                      setState(() => _currentPage = newPage);
                    },
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
