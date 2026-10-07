import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../Controller/Leave/apply_leave.dart';

class CreateLeavePage extends StatefulWidget {
  const CreateLeavePage({super.key});

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
    final fmt = DateFormat('MMM d, yyyy');
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
            DropdownButtonFormField<String>(
              initialValue: _type,
              decoration: const InputDecoration(
                labelText: 'Leave type',
                border: OutlineInputBorder(),
              ),
              items: [
                for (final t in types)
                  DropdownMenuItem(value: t, child: Text(t)),
              ],
              onChanged: (v) => setState(() => _type = v!),
            ),
            OutlinedButton(
              onPressed: () => _pickDate(start: true),
              child: Text(_start == null ? 'Start date' : fmt.format(_start!)),
            ),
            OutlinedButton(
              onPressed: () => _pickDate(start: false),
              child: Text(_end == null ? 'End date' : fmt.format(_end!)),
            ),
            TextField(
              controller: _reason,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Reason',
                border: OutlineInputBorder(),
              ),
            ),
            ElevatedButton(
              onPressed: _sending ? null : _submit,
              child: Text(_sending ? 'Sending...' : 'Submit'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    // take these BEFORE the await: after it, `context` may no longer be valid
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    void say(String text) =>
        messenger.showSnackBar(SnackBar(content: Text(text)));

    // 1) check on the phone first, so a simple mistake does not need a round trip
    if (_start == null || _end == null) {
      say('Pick the start and end dates');
      return;
    }
    if (_reason.text.trim().isEmpty) {
      say('Write a reason for your leave');
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
    say(result.message);

    // 4) success: go back to the Leave tab; `true` tells it to reload its list
    if (result.ok) navigator.pop(true);
  }
}
