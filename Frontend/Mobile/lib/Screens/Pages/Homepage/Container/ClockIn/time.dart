// import 'dart:async';

import 'package:flutter/material.dart';

// import 'package:flutter_biogeohr/Screens/Pages/Homepage/Container/ClockIn/clock_in_button.dart';

class Time extends StatefulWidget {
  final String timerText;
  const Time({super.key, required this.timerText});

  @override
  State<Time> createState() => _TimeState();
}

class _TimeState extends State<Time> {
  @override
  Widget build(BuildContext context) {
    return Text(
      widget.timerText,
      style: TextStyle(
        color: Color(0xFF3A3A3A),
        fontFamily: 'Roboto',
        fontWeight: FontWeight.bold,
        fontSize: 17,
      ),
    );
  }
}
