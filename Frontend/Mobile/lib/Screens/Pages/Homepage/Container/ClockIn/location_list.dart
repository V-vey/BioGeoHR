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

          icon: const Icon(Icons.arrow_drop_down, size: 18),

          hint: Text(selectedValue ?? 'Select Location'),
          items: items.map((String value) {
            //The items
            return DropdownMenuItem<String>(value: value, child: Text(value));
          }).toList(),
          onChanged: (String? newValue) {
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
