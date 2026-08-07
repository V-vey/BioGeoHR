import 'package:flutter/material.dart';

class TextboxEmail extends StatefulWidget {
  final TextEditingController controller;

  const TextboxEmail({super.key, required this.controller});

  @override
  State<TextboxEmail> createState() => _TextboxEmailState();
}

const Color activeColor = Color(0xFF6675EC); // Color when clicked
const Color idleTextColor = Color(0xE63A3A3A); // Color Text being typed

class _TextboxEmailState extends State<TextboxEmail> {
  // const TextBoxEmail({super.key});

  @override
  Widget build(BuildContext context) {
    var textLabel = Text(
      "Enter your Email",
      style: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 15,
        fontWeight: FontWeight.bold,
        // color: idleTextColor,
      ),
    );

    var text = TextFormField(
      textAlign: TextAlign.left,
      keyboardType: TextInputType.emailAddress,
      controller: widget
          .controller, // This is the controller passed through // This is the variable that toggles password visibility
      style: TextStyle(
        //changable color based on focus state
        fontFamily: 'Roboto',
        fontWeight: FontWeight.bold,
        color: WidgetStateColor.resolveWith((states) {
          if (states.contains(WidgetState.focused)) {
            return activeColor;
          }
          return idleTextColor;
        }),
      ),

      decoration: InputDecoration(
        // Layout Padding and size
        contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 10),
        constraints: BoxConstraints(maxWidth: 320),

        maintainHintSize: true,

        //Text Label
        label: textLabel,

        //Bordel Outline
        border: OutlineInputBorder(),

        //Before Clicking
        enabledBorder: const OutlineInputBorder(
          borderSide: BorderSide(
            color: Color(0x703A3A3A), // Changes the idle line color
            width: 2.0, // Normal line thickness
          ),
        ),

        //After Clicking
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(
            color: Color(0xFF6675EC), // Changes the border color when clicked
            width: 2.0, // Makes the border pop out a bit thicker
          ),
        ),

        //Background Color
        fillColor: Color(0xFFFCFCFC),
        filled: true,
      ),
    );
    return text;
  }
}
