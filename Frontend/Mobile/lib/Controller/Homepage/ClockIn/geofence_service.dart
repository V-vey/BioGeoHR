import 'dart:io';

import 'package:flutter_foreground_task/flutter_foreground_task.dart';

import 'geofence_periodic_check.dart';

// Android runs WorkManager's periodic task every 15 minutes at best, and later when the phone sleeps.
// A foreground service (the permanent notification) may keep running, so the check can follow HR's
// interval with the screen off. It runs while clocked in only.
const _title = 'BioGeoHR';
const _clockedInText = 'Checking your location while you are clocked in.';

ForegroundTaskOptions _options(int minutes) => ForegroundTaskOptions(
  eventAction: ForegroundTaskEventAction.repeat(minutes * 60 * 1000),
  allowWakeLock: true,
  allowWifiLock: true,
);

/// Clocked in: start the checks. If they are already running (the app was reopened), only the interval is updated.
Future<void> startGeofenceService(int minutes) async {
  if (!Platform.isAndroid) return; // the system is Android only
  final permission = await FlutterForegroundTask.checkNotificationPermission();
  if (permission != NotificationPermission.granted) {
    await FlutterForegroundTask.requestNotificationPermission();
  }

  FlutterForegroundTask.init(
    androidNotificationOptions: AndroidNotificationOptions(
      channelId: 'geofence_check',
      channelName: 'Location check',
      channelDescription: 'Shown while you are clocked in.',
      onlyAlertOnce: true,
    ),
    iosNotificationOptions: const IOSNotificationOptions(),
    foregroundTaskOptions: _options(minutes),
  );

  if (await FlutterForegroundTask.isRunningService) {
    await FlutterForegroundTask.updateService(foregroundTaskOptions: _options(minutes));
    return;
  }
  await FlutterForegroundTask.startService(
    serviceTypes: [ForegroundServiceTypes.location],
    notificationTitle: _title,
    notificationText: _clockedInText,
    callback: geofenceServiceCallback,
  );
}

/// Clocked out or logged out: stop the checks and remove the notification.
Future<void> stopGeofenceService() async {
  if (!Platform.isAndroid) return;
  await FlutterForegroundTask.stopService();
}

@pragma('vm:entry-point')
void geofenceServiceCallback() {
  FlutterForegroundTask.setTaskHandler(_GeofenceTaskHandler());
}

class _GeofenceTaskHandler extends TaskHandler {
  bool _checking = false; // a slow GPS must not start a second check on top of this one

  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {}

  @override
  void onRepeatEvent(DateTime timestamp) => _check();

  Future<void> _check() async {
    if (_checking) return;
    _checking = true;
    try {
      // the open app has its own timer, which also shows the pop-ups
      if (await FlutterForegroundTask.isAppOnForeground) return;

      switch (await checkGeofencePeriodically()) {
        case GeofenceResult.notClockedIn:
        case GeofenceResult.sessionExpired:
          // clocked out elsewhere, a new day, logged out or the session ended: nothing to check
          await FlutterForegroundTask.stopService();
        case GeofenceResult.outOfRange:
          await FlutterForegroundTask.updateService(
            notificationText: 'You are outside your work area. HR can see this on your attendance.',
          );
        case GeofenceResult.gpsOff:
          await FlutterForegroundTask.updateService(
            notificationText: 'Your GPS is off. HR can see that your location could not be checked.',
          );
        case GeofenceResult.inRange:
          await FlutterForegroundTask.updateService(notificationText: _clockedInText);
        case GeofenceResult.failed:
          break;
      }
    } finally {
      _checking = false;
    }
  }

  @override
  Future<void> onDestroy(DateTime timestamp, bool isTimeout) async {}
}
