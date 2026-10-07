import 'package:flutter/material.dart';

import '../../../Controller/Homepage/my_leave.dart';
import '../../Reusable/Items/leave_item.dart';

/// The "Leave Request" card on the Leave tab: every leave request of the employee,
/// newest first. The card keeps its fixed height and the list scrolls inside it.
class LeaveHistory extends StatefulWidget {
  // optional loader so the card can be tested without a server
  final Future<List<LeaveRequestData>> Function()? loader;

  const LeaveHistory({super.key, this.loader});

  @override
  State<LeaveHistory> createState() => _LeaveHistoryState();
}

class _LeaveHistoryState extends State<LeaveHistory> {
  // loaded once (creating the Future inside build would call the server on every rebuild)
  late final Future<List<LeaveRequestData>> _leaves =
      (widget.loader ?? MyLeave().getAll)();

  Widget _message(String text) => Center(
    child: Padding(
      padding: const EdgeInsets.all(20),
      child: Text(text, style: const TextStyle(color: Colors.grey)),
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      height: 455,
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
              'Leave Request',
              style: TextStyle(
                fontFamily: 'Roboto',
                color: Color(0xFF6675EC),
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Container(height: 1, width: 350, color: Color(0xFFE0E0E0)),
          // the list takes the rest of the card's height and scrolls inside it
          Expanded(
            child: FutureBuilder<List<LeaveRequestData>>(
              future: _leaves,
              builder: (context, snap) {
                if (snap.connectionState != ConnectionState.done) {
                  return const Center(
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  );
                }
                if (snap.hasError) {
                  return _message('Could not load your leave requests');
                }

                final leaves = snap.data ?? <LeaveRequestData>[];
                if (leaves.isEmpty) return _message('No leave requests yet');

                return ListView.builder(
                  padding: EdgeInsets.zero,
                  itemCount: leaves.length,
                  itemBuilder: (context, i) {
                    final l = leaves[i];
                    return LeaveItem(
                      status: l.status,
                      type: l.type,
                      date: l.dateRange,
                      remarks: l.remarks,
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
