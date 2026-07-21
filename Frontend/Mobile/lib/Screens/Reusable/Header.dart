import 'package:flutter/material.dart';
import 'TextBioGeoHR.dart';

class Header extends StatelessWidget implements PreferredSizeWidget {
  const Header({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return
      DecoratedBox(
        decoration: BoxDecoration(
          color: const Color(0xFFFCFCFC), // Matches your app bar background
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(20), // Subtle light gray shadow
              blurRadius: 6.0,                  // Softness of the shadow line
              spreadRadius: 4.0,                 // Distance it extends
              offset: const Offset(0, 2),        // Moves shadow slightly downwards
            ),
          ],
        ), 
        child: AppBar(
        automaticallyImplyLeading: false,
        scrolledUnderElevation: 0.0,             // Prevents elevation tint change on scroll
        backgroundColor: Color(0xFFFCFCFC),   // Stops the Material 3 blend effect
        title: const BioGeoHRLogo(textSize: 24),

      )
    );
  }
}