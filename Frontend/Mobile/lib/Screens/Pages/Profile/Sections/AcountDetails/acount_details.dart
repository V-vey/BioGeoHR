import 'package:flutter/material.dart';

class AcountDetails extends StatefulWidget {
  const AcountDetails({super.key});

  @override
  State<AcountDetails> createState() => _AccountDetailsState();
}

bool isVisible = false;
IconData icon = Icons.chevron_right;

class _AccountDetailsState extends State<AcountDetails> {
  @override
  Widget build(BuildContext context) {
    var items = Container(
      width: 350,
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: Color(0xFFFCFCFC),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 6.0,
            spreadRadius: 4.0,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.manage_accounts, size: 30),
              SizedBox(width: 10),
              Text(
                "Account Details",
                style: TextStyle(
                  color: Color(0xFF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Spacer(),
              IconButton(
                iconSize: 30,
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                onPressed: () {
                  setState(() {
                    isVisible = !isVisible;
                    icon = isVisible ? Icons.expand_more : Icons.chevron_right;
                  });
                },
                icon: Icon(icon),
              ),
            ],
          ),
          if (isVisible) ...[
            SizedBox(height: 5),
            Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
          ],
        ],
      ),
    );
    return items;
  }
}
