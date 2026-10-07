import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../Service/url.dart';

/// The employee's photo. The photo route needs the login token, so a plain Image.network(url)
/// would be refused (401): the token goes in as a header. With no photo, or if loading
/// fails, a grey person icon is shown instead.
class ProfilePicture extends StatefulWidget {
  final String imagePath; // "avatars/xxx.png", or '' when the employee has no photo
  final double size;

  const ProfilePicture({super.key, required this.imagePath, this.size = 100});

  @override
  State<ProfilePicture> createState() => _ProfilePictureState();
}

class _ProfilePictureState extends State<ProfilePicture> {
  String? _token;

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((prefs) {
      if (mounted) setState(() => _token = prefs.getString('token'));
    });
  }

  Widget _placeholder() => Container(
    color: const Color(0xFFE0E0E0),
    alignment: Alignment.center,
    child: Icon(Icons.person, size: widget.size * 0.55, color: Colors.grey),
  );

  @override
  Widget build(BuildContext context) {
    final hasPhoto = widget.imagePath.isNotEmpty && _token != null;

    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: hasPhoto
            ? Image.network(
                '${Url().api}/${widget.imagePath}', // .../api/avatars/xxx.png
                headers: {
                  'Authorization': 'Bearer $_token',
                  // free ngrok otherwise answers with a warning page instead of the image
                  'ngrok-skip-browser-warning': 'true',
                },
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => _placeholder(),
                loadingBuilder: (context, child, progress) =>
                    progress == null ? child : _placeholder(),
              )
            : _placeholder(),
      ),
    );
  }
}
