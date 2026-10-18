import 'package:flutter/material.dart';

import 'session_client.dart' show navigatorKey;

// the centered pop-up the web admin uses (DialogHost), for every message the phone shows
enum _Kind { success, error, warning }

class _Look {
  final Color color;
  final Color on;
  final IconData icon;
  const _Look(this.color, this.on, this.icon);
}

const _looks = {
  _Kind.success: _Look(Color(0xFF2AAF56), Colors.white, Icons.check),
  _Kind.error: _Look(Color(0xFFEC6668), Colors.white, Icons.close),
  _Kind.warning: _Look(
    Color(0xFFEACA3A),
    Color(0xFF412402),
    Icons.warning_amber_rounded,
  ),
};

Future<void> showSuccess(String message, {String title = 'Done'}) =>
    _show(_Kind.success, title, message);

Future<void> showError(
  String message, {
  String title = 'Something went wrong',
}) => _show(_Kind.error, title, message);

Future<void> showWarning(String message, {String title = 'Heads up'}) =>
    _show(_Kind.warning, title, message);

// needs no BuildContext, so it also works from code that is not a screen (a dead session)
Future<void> _show(_Kind kind, String title, String message) async {
  final host = navigatorKey.currentState?.overlay?.context;
  if (host == null) return;
  final look = _looks[kind]!;

  await showDialog<void>(
    context: host,
    builder: (ctx) => Dialog(
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 28),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: look.color,
                  shape: BoxShape.circle,
                ),
                child: Icon(look.icon, color: look.on, size: 26),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF3A3A3A),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.4,
                  color: Color(0xFF8A90A3),
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: FilledButton.styleFrom(
                    backgroundColor: look.color,
                    foregroundColor: look.on,
                    shape: const StadiumBorder(),
                  ),
                  child: const Text('OK'),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
