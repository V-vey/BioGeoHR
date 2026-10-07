import 'package:local_auth/local_auth.dart';

import 'package:local_auth_android/local_auth_android.dart';
import 'package:local_auth_darwin/local_auth_darwin.dart';

class Biometric {
  final LocalAuthentication auth = LocalAuthentication();
  late List<BiometricType> availableBiometric;
  Future<(bool, String?)> authenticateUser() async {
    try {
      availableBiometric = await auth.getAvailableBiometrics();
      if (availableBiometric.isEmpty) {
        // Android offers nothing to apps: no fingerprint/face enrolled, or the phone's
        // face unlock is only rated for unlocking the screen
        return (
          false,
          'No fingerprint or face is available for apps on this phone. '
              'Set one up in your phone settings.',
        );
      }

      if (availableBiometric.contains(BiometricType.face)) {
        print("Face Reveal");
      }
      if (availableBiometric.contains(BiometricType.fingerprint)) {
        // print("Finger style");
      }
      if (availableBiometric.contains(BiometricType.weak)) {
        // print("weakling");
      }
      if (availableBiometric.contains(BiometricType.strong)) {
        // print("Strong one tap");
      }
      // print("available Biometric:: $availableBiometric");
      // isAuthenticate = await auth.authenticate(
      //   localizedReason: "Please authenticate to proceed",
      //   biometricOnly: true,
      // );
      final bool didAuthenticate = await auth.authenticate(
        localizedReason: 'Please authenticate to clock in',
        biometricOnly: true,
        authMessages: const <AuthMessages>[
          AndroidAuthMessages(
            signInTitle: 'Oops! Biometric authentication required!',
            cancelButton: 'No thanks',
          ),
          IOSAuthMessages(cancelButton: 'No thanks'),
        ],
      );
      if (!didAuthenticate) {
        return (false, 'Biometric check failed. Please try again.');
      }
      return (true, null);
    } on LocalAuthException catch (e) {
      // the employee needs a sentence, not the exception text
      switch (e.code) {
        case LocalAuthExceptionCode.userCanceled:
          return (false, 'Biometric check was cancelled.');
        case LocalAuthExceptionCode.noBiometricsEnrolled:
          return (false, 'No fingerprint or face is set up on this phone.');
        case LocalAuthExceptionCode.noBiometricHardware:
          return (false, 'This phone has no fingerprint or face sensor.');
        case LocalAuthExceptionCode.temporaryLockout:
        case LocalAuthExceptionCode.biometricLockout:
          return (
            false,
            'Too many attempts. Unlock your phone with your PIN, then try again.',
          );
        default:
          return (false, 'Biometric check failed (${e.code.name}).');
      }
    } catch (_) {
      return (false, 'Biometric check is not available on this phone.');
    }
  }
}
