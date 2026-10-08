import 'package:flutter/material.dart';

import '../../../Controller/Homepage/my_leave.dart';
import '../../Reusable/Badge/leave_badge.dart';
import 'leave_card.dart';

/// One row of Leave History, like the mockup: type, status and a View button on top,
/// then the dates, the duration and the day it was submitted.
class LeaveHistoryItem extends StatelessWidget {
  final LeaveRequestData leave;
  final VoidCallback onView;

  const LeaveHistoryItem({super.key, required this.leave, required this.onView});

  static const _small = TextStyle(
    fontFamily: 'Roboto',
    fontSize: 12.5,
    color: Color(0x993A3A3A),
  );

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE0E0E0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  leave.type,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Color(0xFF3A3A3A),
                  ),
                ),
              ),
              LeaveBadge(status: leave.status),
              const SizedBox(width: 6),
              SizedBox(
                height: 26,
                child: ElevatedButton(
                  onPressed: onView,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: leaveGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(13),
                    ),
                  ),
                  child: const Text(
                    'View',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(child: Text('Date: ${leave.dateSpan}', style: _small)),
              Text('Duration: ${leave.durationText}', style: _small),
            ],
          ),
          if (leave.submittedOn.isNotEmpty)
            Text('Submitted on: ${leave.submittedOn}', style: _small),
        ],
      ),
    );
  }
}
