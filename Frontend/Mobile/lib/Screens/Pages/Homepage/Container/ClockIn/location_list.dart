import 'package:flutter/material.dart';
import '../../../../../Controller/Homepage/ClockIn/get_location.dart';
// import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../Service/auth_storage.dart';

class LocationList extends StatefulWidget {
  // The place the employee clocked in at, while they are clocked in: it is shown and cannot be changed.
  // null = nobody is clocked in, so any place can be chosen.
  final String? lockedTo;
  const LocationList({super.key, this.lockedTo});
  @override
  State<LocationList> createState() => _LocationListState();
}

final AuthStorage authStorage = AuthStorage();

class _LocationListState extends State<LocationList> {
  @override
  void initState() {
    super.initState();
    authStorage
        .removeTemp(); // nothing is chosen, which is what "Select Location" shows
  }

  @override
  void didUpdateWidget(LocationList old) {
    super.didUpdateWidget(old);
    final locked = widget.lockedTo;
    if (locked != null && locked != selectedValue) {
      // clocked in: show the place of the clock-in, and keep it as the chosen place, because the
      // location checks while clocked in (and the clock-out) read it from the temp file
      setState(() => selectedValue = locked);
      authStorage.saveTemp(locked);
    }
  }

  //location Available
  final GetLocation location = GetLocation();
  //default
  String? selectedValue = 'Select Location';
  late final Future<List<String>> listLocation = location.getLocation();
  late String temp;
  final AuthStorage authStorage = AuthStorage();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<String>>(
      future: listLocation,
      builder: (context, snapshot) {
        final items = snapshot.data ?? <String>[];
        final locked = widget.lockedTo != null;
        //Button for it
        return DropdownButton<String>(
          value: items.contains(selectedValue) ? selectedValue : null,
          style: const TextStyle(
            color: Color(0xFF3A3A3A),
            fontFamily: 'Roboto',
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
          dropdownColor: Color(0xFFFCFCFC),
          elevation: 1,
          alignment: AlignmentDirectional.center,
          isDense: true,

          underline: const SizedBox.shrink(),

          icon: Icon(
            locked ? Icons.lock_outline : Icons.arrow_drop_down,
            size: 18,
          ),

          hint: Text(selectedValue ?? 'Select Location'),
          items: items.map((String value) {
            //The items
            return DropdownMenuItem<String>(value: value, child: Text(value));
          }).toList(),
          // no handler = the box is disabled, while the employee is clocked in
          onChanged: locked
              ? null
              : (String? newValue) {
                  setState(() {
                    selectedValue = newValue;
                    //save to the temp file
                    authStorage.saveTemp(selectedValue!);
                  });
                },
        );
      },
    );
  }
}
