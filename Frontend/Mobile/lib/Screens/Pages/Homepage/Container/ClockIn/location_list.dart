import 'package:flutter/material.dart';
import '../../../../../Service/GetLocation.dart';
// import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../Service/AuthStorage.dart';

class LocationList extends StatefulWidget {
  @override
  State<LocationList> createState() => _LocationListState();
}

class _LocationListState extends State<LocationList> {
  //location Available
  final GetLocation location = GetLocation();
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
        return DropdownButton<String>(
          value: items.contains(selectedValue) ? selectedValue : null,
          hint: Text(selectedValue ?? 'Select Location'),
          items: items.map((String value) {
            return DropdownMenuItem<String>(value: value, child: Text(value));
          }).toList(),
          onChanged: (String? newValue) {
            setState(() {
              selectedValue = newValue;
              authStorage.saveTemp(selectedValue!);
              print(selectedValue);
            });
          },
        );
      },
    );
  }
}
