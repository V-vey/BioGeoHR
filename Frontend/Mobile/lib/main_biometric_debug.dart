import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';

void main() => runApp(const MaterialApp(home: BiometricDebug()));

class BiometricDebug extends StatefulWidget {
  const BiometricDebug({super.key});
  @override
  State<BiometricDebug> createState() => _BiometricDebugState();
}

class _BiometricDebugState extends State<BiometricDebug> {
  final auth = LocalAuthentication();
  String report = 'Reading...';

  @override
  void initState() {
    super.initState();
    _read();
  }

  Future<void> _read() async {
    final supported = await auth.isDeviceSupported();
    final canCheck = await auth.canCheckBiometrics;
    final list = await auth.getAvailableBiometrics();
    setState(
      () => report =
          'isDeviceSupported: $supported\n'
          'canCheckBiometrics: $canCheck\n'
          'getAvailableBiometrics: ${list.map((e) => e.name).toList()}',
    );
  }

  Future<void> _try(bool biometricOnly) async {
    try {
      final ok = await auth.authenticate(
        localizedReason: 'Debug test',
        biometricOnly: biometricOnly,
      );
      setState(
        () => report +=
            '\nprompt(biometricOnly=$biometricOnly): ${ok ? "SUCCESS" : "failed"}',
      );
    } on LocalAuthException catch (e) {
      setState(
        () => report +=
            '\nprompt(biometricOnly=$biometricOnly): ERROR ${e.code.name}',
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Biometric debug')),
    body: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(report, style: const TextStyle(fontSize: 18)),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _read, child: const Text('Refresh')),
          ElevatedButton(
            onPressed: () => _try(true),
            child: const Text('Prompt (biometric only)'),
          ),
          ElevatedButton(
            onPressed: () => _try(false),
            child: const Text('Prompt (biometric or PIN)'),
          ),
        ],
      ),
    ),
  );
}
