import 'package:flutter/material.dart';

class TextboxPassword extends StatefulWidget {
  final TextEditingController controller;

  TextboxPassword({super.key, required this.controller});

  @override
  State<TextboxPassword> createState() => _TextboxPasswordState();
}

class _TextboxPasswordState extends State<TextboxPassword> {
  @override
  Widget build(BuildContext context) {
    var text = Container(
      width: 320,
      height: 40,
      decoration: BoxDecoration(
        color: Color(0xFFFCFCFC),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Color(0x24000000), width: 2),
      ),
      child: TextFormField(
        keyboardType: TextInputType.visiblePassword,
        enableSuggestions: false,
        autocorrect: false,
        controller: widget.controller,
        textAlign: TextAlign.center,
        textAlignVertical: TextAlignVertical.center,
        style: TextStyle(
          fontFamily: 'Roboto',
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Color(0xFF3A3A3A),
        ),
        decoration: InputDecoration(
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 9),
          hintStyle: TextStyle(
            fontFamily: 'Roboto',
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: const Color(0x31000000),
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: const BorderSide(
              color: Color(0x503A3A3A), // Changes border to green when focused
              width: 1.0,
            ),
          ),
          // border: OutlineInputBorder(),
          hintText: "Enter your Password",
        ),
      ),
    );
    return text;
  }
}
