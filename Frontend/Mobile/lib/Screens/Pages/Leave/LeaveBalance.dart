import 'package:flutter/material.dart';

class LeaveBalance extends StatelessWidget {
  final String annualBal;
  final String sickBal;
  final String unpaidBal;
  final String patBal;

  const LeaveBalance({
    super.key,
    required this.annualBal,
    required this.patBal,
    required this.unpaidBal,
    required this.sickBal
  });


  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        spacing: 15,
        children: [
          Row(
            spacing: 15,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [ 

              //Annual Leave
              Container(
                width: 165,
                height: 70,
                decoration: BoxDecoration( 
                  borderRadius: BorderRadius.circular(10),
                  color: Color(0xFFFCFCFC),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(20),
                      blurRadius: 6.0,
                      spreadRadius: 4.0,
                      offset: const Offset(0, 2)
                    )
                  ]
                ),
                padding: EdgeInsets.all(15),
                child: Row(
                  
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Annual",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF3A3A3A)
                      ),
                    ),
                    Text(annualBal,
                      style: TextStyle(
                        color: Color(0x903A3A3A),
                        fontFamily: 'Roboto',
                        fontSize: 18
                      ),
                    )
                  ],
                ),
              ),
            
              //Sick Leave
              Container(
                width: 165,
                height: 70,
                decoration: BoxDecoration( 
                  borderRadius: BorderRadius.circular(10),
                  color: Color(0xFFFCFCFC),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(20),
                      blurRadius: 6.0,
                      spreadRadius: 4.0,
                      offset: const Offset(0, 2)
                    )
                  ]
                ),
                padding: EdgeInsets.all(15),
                child: Row(
                  
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Sick",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF3A3A3A)
                      ),
                    ),
                    Text(sickBal,
                      style: TextStyle(
                        color: Color(0x903A3A3A),
                        fontFamily: 'Roboto',
                        fontSize: 18
                      ),
                    )
                  ],
                ),
              )
            ],
          ),
          Row(
            spacing: 15,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [ 

              //Unpaid
              Container(
                width: 165,
                height: 70,
                decoration: BoxDecoration( 
                  borderRadius: BorderRadius.circular(10),
                  color: Color(0xFFFCFCFC),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(20),
                      blurRadius: 6.0,
                      spreadRadius: 4.0,
                      offset: const Offset(0, 2)
                    )
                  ]
                ),
                padding: EdgeInsets.all(15),
                child: Row(
                  
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Unpaid",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF3A3A3A)
                      ),
                    ),
                    Text(unpaidBal,
                      style: TextStyle(
                        color: Color(0x903A3A3A),
                        fontFamily: 'Roboto',
                        fontSize: 18
                      ),
                    )
                  ],
                ),
              ),

              //Paternity Leave
              Container(
                width: 165,
                height: 70,
                decoration: BoxDecoration( 
                  borderRadius: BorderRadius.circular(10),
                  color: Color(0xFFFCFCFC),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(20),
                      blurRadius: 6.0,
                      spreadRadius: 4.0,
                      offset: const Offset(0, 2)
                    )
                  ]
                ),
                padding: EdgeInsets.all(15),
                child: Row(
                  
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Patternity",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF3A3A3A)
                      ),
                    ),
                    Text(patBal,
                      style: TextStyle(
                        color: Color(0x903A3A3A),
                        fontFamily: 'Roboto',
                        fontSize: 18
                      ),
                    )
                  ],
                ),
              )
            ],
          ),
        ],
      )
    );
  }

}