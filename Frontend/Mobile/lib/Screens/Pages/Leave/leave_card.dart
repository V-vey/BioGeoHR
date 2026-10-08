import 'package:flutter/material.dart';

/// The green and red of the leave screens (the "Create" / "View" / "Back" and "Cancel" buttons).
const leaveGreen = Color(0xFF2AAF56);
const leaveRed = Color(0xFFEC6668);

/// A white rounded box with a thin border, the building block of the Create and View screens.
class LeaveCard extends StatelessWidget {
  final Widget child;
  const LeaveCard({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: const Color(0xFFFCFCFC),
        border: Border.all(color: const Color(0xFFE0E0E0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 6.0,
            spreadRadius: 1.0,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

/// A card's grey heading ("Date", "Reason") with the thin line under it.
class LeaveCardTitle extends StatelessWidget {
  final String text;
  const LeaveCardTitle(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          text,
          style: const TextStyle(
            fontFamily: 'Roboto',
            fontSize: 16,
            color: Color(0x993A3A3A),
          ),
        ),
        const SizedBox(height: 4),
        Container(height: 1, color: const Color(0xFFE0E0E0)),
        const SizedBox(height: 10),
      ],
    );
  }
}

/// A rounded green or red button like the ones in the mockup.
class LeavePillButton extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback? onPressed; // null = disabled (while waiting for the server)

  const LeavePillButton({
    super.key,
    required this.label,
    required this.color,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 130,
      height: 38,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          disabledBackgroundColor: color.withAlpha(120),
          disabledForegroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}
