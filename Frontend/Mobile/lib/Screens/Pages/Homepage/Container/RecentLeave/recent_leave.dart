import 'package:flutter/material.dart';

import '../../../../../Controller/Homepage/my_leave.dart';
import '../../../../Reusable/Items/leave_item.dart';

class RecentLeave extends StatefulWidget {
  // optional loader so the card can be tested without a server
  final Future<List<LeaveRequestData>> Function()? loader;

  const RecentLeave({super.key, this.loader});

  @override
  State<RecentLeave> createState() => _RecentLeaveState();
}

class _RecentLeaveState extends State<RecentLeave> {
  static const int _show = 3; // how many recent requests the home card lists

  // loaded once (creating the Future inside build would call the server on every rebuild)
  late final Future<List<LeaveRequestData>> _leaves =
      (widget.loader ?? MyLeave().getAll)();

  Widget _message(String text) => Padding(
    padding: const EdgeInsets.all(16),
    child: Text(text, style: const TextStyle(color: Colors.grey)),
  );

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
        children: [
          Container(
            padding: EdgeInsets.all(10),
            child: Text(
              'Recent Leave',
              style: TextStyle(
                fontFamily: 'Roboto',
                color: Color(0xFF6675EC),
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
          SizedBox(height: 5),
          FutureBuilder<List<LeaveRequestData>>(
            future: _leaves,
            builder: (context, snap) {
              if (snap.connectionState != ConnectionState.done) {
                return const Padding(
                  padding: EdgeInsets.all(16),
                  child: SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              }
              if (snap.hasError) return _message('Unavailable');

              final leaves = snap.data ?? <LeaveRequestData>[];
              if (leaves.isEmpty) return _message('No leave requests yet');

              return Column(
                children: [
                  for (final l in leaves.take(_show))
                    LeaveItem(
                      status: l.status,
                      type: l.type,
                      date: l.dateRange,
                      remarks: l.remarks,
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
