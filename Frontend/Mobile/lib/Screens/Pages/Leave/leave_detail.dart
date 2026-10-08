import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../Controller/Homepage/my_leave.dart';
import '../../../Controller/Leave/cancel_leave.dart';
import '../../Reusable/Badge/leave_badge.dart';
import 'leave_card.dart';

/// The View screen of one leave request: type and status, dates, the reason the employee
/// wrote, and HR's remarks. A pending request can be cancelled from here.
class LeaveDetailPage extends StatefulWidget {
  final LeaveRequestData leave;
  const LeaveDetailPage({super.key, required this.leave});

  @override
  State<LeaveDetailPage> createState() => _LeaveDetailPageState();
}

class _LeaveDetailPageState extends State<LeaveDetailPage> {
  bool _busy = false;

  static const _text = TextStyle(
    fontFamily: 'Roboto',
    fontSize: 15,
    color: Color(0xFF3A3A3A),
  );

  Widget _dateBox(DateTime d) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF3A3A3A)),
      ),
      child: Text(DateFormat('M/d/yyyy').format(d), style: _text),
    ),
  );

  Widget _textBox(String text) => Container(
    width: double.infinity,
    constraints: const BoxConstraints(minHeight: 120),
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(6),
      border: Border.all(color: const Color(0xFF3A3A3A)),
    ),
    child: Text(text, style: _text.copyWith(fontSize: 14)),
  );

  Future<void> _cancel() async {
    // take these BEFORE the awaits: after them, `context` may no longer be valid
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    final sure = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel this request?'),
        content: const Text('The leave request will be removed.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Keep it'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Cancel request', style: TextStyle(color: leaveRed)),
          ),
        ],
      ),
    );
    if (sure != true || !mounted) return;

    setState(() => _busy = true); // the buttons are disabled, so a double tap cannot send twice
    final result = await CancelLeave().cancel(widget.leave.id);
    if (!mounted) return; // the user left the page while waiting
    setState(() => _busy = false);

    messenger.showSnackBar(SnackBar(content: Text(result.message)));
    // success: go back to the list; `true` tells it to reload
    if (result.ok) navigator.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final l = widget.leave;
    final hasRemarks = (l.remarks ?? '').trim().isNotEmpty;

    return Scaffold(
      appBar: AppBar(title: const Text('Leave request')), // has the back arrow
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(15),
        child: Column(
          spacing: 15,
          children: [
            LeaveCard(
              child: Row(
                children: [
                  const Text('Leave Type: ', style: TextStyle(fontSize: 16, color: Color(0x993A3A3A))),
                  Expanded(child: Text(l.type, overflow: TextOverflow.ellipsis, style: _text)),
                  LeaveBadge(status: l.status),
                ],
              ),
            ),
            LeaveCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const LeaveCardTitle('Date'),
                  Row(
                    spacing: 12,
                    children: [_dateBox(l.startDate), _dateBox(l.endDate)],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Duration: ${l.durationText}'
                    '${l.submittedOn.isEmpty ? '' : '   ·   Submitted on: ${l.submittedOn}'}',
                    style: const TextStyle(fontSize: 12.5, color: Color(0x993A3A3A)),
                  ),
                ],
              ),
            ),
            LeaveCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const LeaveCardTitle('Reason'),
                  _textBox(l.reason.trim().isEmpty ? 'No reason given' : l.reason),
                ],
              ),
            ),
            if (hasRemarks)
              LeaveCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const LeaveCardTitle('HR remarks'),
                    _textBox(l.remarks!),
                  ],
                ),
              ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                LeavePillButton(
                  label: 'Back',
                  color: leaveGreen,
                  onPressed: _busy ? null : () => Navigator.pop(context),
                ),
                // only a request still waiting for HR can be cancelled
                if (l.status == 'Pending')
                  LeavePillButton(
                    label: _busy ? 'Cancelling...' : 'Cancel',
                    color: leaveRed,
                    onPressed: _busy ? null : _cancel,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
