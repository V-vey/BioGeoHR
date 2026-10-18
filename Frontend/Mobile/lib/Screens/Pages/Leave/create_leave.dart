import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../Controller/Homepage/leave_balance.dart' show LeaveBalances;
import '../../../Controller/Leave/apply_leave.dart';
import '../Homepage/Container/LeaveBalance/leave_balance_main.dart';
import '../../../Service/dialogs.dart';
import 'leave_card.dart';

class CreateLeavePage extends StatefulWidget {
  // optional loader for the balance card, so the page can be tested without a server
  final Future<LeaveBalances> Function()? balanceLoader;

  const CreateLeavePage({super.key, this.balanceLoader});

  @override
  State<CreateLeavePage> createState() => _CreateLeavePageState();
}

class _CreateLeavePageState extends State<CreateLeavePage> {
  static const types = [
    'Sick Leave',
    'Vacation Leave',
    'Emergency Leave',
    'Birthday Leave',
    'Solo Parent Leave',
    'Paternity Leave',
    'Maternity Leave',
  ];

  final _reason = TextEditingController();
  String _type = types.first;
  DateTime? _start;
  DateTime? _end;
  bool _sending = false;

  Future<void> _pickDate({required bool start}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: (start ? _start : _end) ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      if (start) {
        _start = picked;
        if (_end != null && _end!.isBefore(picked))
          _end = picked; // end can't be before start
      } else {
        _end = picked;
      }
    });
  }

  @override
  void dispose() {
    _reason.dispose(); // free the text controller
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('M/d/yyyy');

    Widget dateButton(String hint, DateTime? value, bool start) => Expanded(
      child: OutlinedButton(
        onPressed: () => _pickDate(start: start),
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF3A3A3A),
          side: const BorderSide(color: Color(0xFF3A3A3A)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(value == null ? hint : fmt.format(value)),
      ),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Apply for leave'),
      ), // has the back arrow
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(15),
        child: Column(
          spacing: 15,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // the same Leave Balance card as the home screen, so the credits are in view
            // while choosing the type and the days
            HomeLeaveBalance(loader: widget.balanceLoader),
            // Leave Type: [ dropdown ]
            LeaveCard(
              child: Row(
                children: [
                  const Text(
                    'Leave Type:',
                    style: TextStyle(fontSize: 16, color: Color(0x993A3A3A)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _type,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        isDense: true,
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 8,
                        ),
                      ),
                      items: [
                        for (final t in types)
                          DropdownMenuItem(value: t, child: Text(t)),
                      ],
                      onChanged: (v) => setState(() => _type = v!),
                    ),
                  ),
                ],
              ),
            ),
            // Date: [ start ] [ end ]
            LeaveCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const LeaveCardTitle('Date'),
                  Row(
                    spacing: 12,
                    children: [
                      dateButton('Start Date', _start, true),
                      dateButton('End Date', _end, false),
                    ],
                  ),
                ],
              ),
            ),
            // Reason: a big text area
            LeaveCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const LeaveCardTitle('Reason'),
                  TextField(
                    controller: _reason,
                    minLines: 9,
                    maxLines: 9,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                    ),
                  ),
                ],
              ),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: LeavePillButton(
                label: _sending ? 'Sending...' : 'Create',
                color: leaveGreen,
                onPressed: _sending ? null : _submit,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    // take these BEFORE the await: after it, `context` may no longer be valid
    final navigator = Navigator.of(context);
    Future<void> say(String text) =>
        showError(text, title: 'Check your request');

    // 1) check on the phone first, so a simple mistake does not need a round trip
    if (_start == null || _end == null) {
      await say('Pick the start and end dates');
      return;
    }
    if (_reason.text.trim().isEmpty) {
      await say('Write a reason for your leave');
      return;
    }

    // 2) send it; the button is disabled while waiting, so a double tap cannot send twice
    setState(() => _sending = true);
    final result = await ApplyLeave().send(
      type: _type,
      start: _start!,
      end: _end!,
      reason: _reason.text.trim(),
    );
    if (!mounted) return; // the user left the page while waiting
    setState(() => _sending = false);

    // 3) tell them what happened (the server's own words)
    if (result.ok) {
      await showSuccess(result.message, title: 'Request sent');
      // 4) success: go back to the Leave tab; `true` tells it to reload its list
      navigator.pop(true);
    } else {
      await showError(result.message, title: "Couldn't send request");
    }
  }
}
