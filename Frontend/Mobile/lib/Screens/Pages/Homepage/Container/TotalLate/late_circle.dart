import 'package:flutter/material.dart';
// import 'package:flutter_biogeohr/Screens/Pages/Profile/Sections/AcountDetails/account_details.dart';
import '../../../../../Controller/Homepage/count_late.dart';

class LateCircle extends StatefulWidget {
  const LateCircle({super.key});

  @override
  State<LateCircle> createState() => _LateCircleState();
}

class _LateCircleState extends State<LateCircle> {
  final CountLate late = CountLate();
  bool isLateMax = false;
  Color color = Color(0xFFEACA3A);
  int val = 0; // value of the progression of the late
  @override
  void initState() {
    super.initState();

    _countLate();
  }

  Future<void> _countLate() async {
    final result = await late.countLates();

    setState(() {
      val = result;
      if (val >= 3) {
        isLateMax = true;
        color = Color(0xFFEC6668);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    //SOON The Circle Should be an arc
    return SizedBox(
      height: 110,
      width: 110,
      child: Stack(
        children: [
          //Indicator
          Container(
            width: 110,
            height: 110,
            padding: EdgeInsets.all(10),
            child: CircularProgressIndicator(
              color: Color(0x30EACA3A),
              value: 3 / 3,
              strokeWidth: 5,
            ),
          ),
          //Progression
          Container(
            width: 110,
            height: 110,
            padding: EdgeInsets.all(10),
            child: CircularProgressIndicator(
              color: color,

              value: val / 3,
              strokeWidth: 5,
            ),
          ),
          //if not max
          if (!isLateMax) ...[
            Center(
              child: Text(
                "$val / 3",
                style: TextStyle(
                  fontFamily: 'Roboto',
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ),
          ],
          if (isLateMax) ...[
            Center(
              child: Icon(Icons.warning, size: 40, color: Color(0xFFEC6668)),
            ),
          ],
        ],
      ),
    );
  }
}
