import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // input formatters for the contact number
import 'package:image_picker/image_picker.dart';

import '../../../../../Controller/Profile/update_profile.dart';
import '../../../../../Service/dialogs.dart';
import '../../profile_picture.dart';

/// The employee edits their own contact number, address and photo.
/// Everything else on the profile (name, department, salary ...) is changed by HR.
class EditProfile extends StatefulWidget {
  final String contact;
  final String address;
  final String imagePath; // current photo ("avatars/xxx.png"), '' when none

  const EditProfile({
    super.key,
    required this.contact,
    required this.address,
    this.imagePath = '',
  });

  @override
  State<EditProfile> createState() => _EditProfile();
}

class _EditProfile extends State<EditProfile> {
  late final TextEditingController _contact = TextEditingController(
    text: widget.contact,
  );
  late final TextEditingController _address = TextEditingController(
    text: widget.address,
  );
  File? _newImage; // the photo picked just now, not saved yet
  bool _saving = false;

  // same rule as the server (Users::formatPhone): a Philippine mobile number, 09XX XXX XXXX or
  // +63 9XX XXX XXXX, spaces and dashes allowed
  static final _phone = RegExp(r'^(?:\+?63|0)9\d{9}$');
  static String _compact(String s) => s.replaceAll(RegExp(r'[\s\-().]'), '');

  Future<void> _pickPhoto() async {
    // maxWidth/imageQuality keep the upload small (the server accepts up to 2 MB)
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      imageQuality: 85,
    );
    if (picked == null) return; // the user backed out of the gallery
    setState(() => _newImage = File(picked.path));
  }

  @override
  void dispose() {
    _contact.dispose(); // free the text controllers
    _address.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit profile')), // has the back arrow
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(15),
        child: Column(
          spacing: 15,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: SizedBox(
                  width: 100,
                  height: 100,
                  child: _newImage != null
                      ? Image.file(_newImage!, fit: BoxFit.cover)
                      : ProfilePicture(imagePath: widget.imagePath),
                ),
              ),
            ),
            TextButton.icon(
              onPressed: _saving ? null : _pickPhoto,
              icon: const Icon(Icons.photo_library),
              label: Text(_newImage == null ? 'Choose photo' : 'Change photo'),
            ),
            TextField(
              controller: _contact,
              keyboardType: TextInputType.phone,
              // digits, a +, spaces and dashes only: no letters
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9+\s\-]')),
                LengthLimitingTextInputFormatter(16),
              ],
              decoration: const InputDecoration(
                labelText: 'Contact number',
                hintText: '0917 123 4567',
                border: OutlineInputBorder(),
              ),
            ),
            TextField(
              controller: _address,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Address',
                border: OutlineInputBorder(),
              ),
            ),
            ElevatedButton(
              onPressed: _saving ? null : _save,
              child: Text(_saving ? 'Saving...' : 'Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    // take these BEFORE the await: after it, `context` may no longer be valid
    final navigator = Navigator.of(context);
    Future<void> say(String text) =>
        showError(text, title: 'Check your details');

    // 1) check on the phone first, so a simple mistake does not need a round trip
    final contact = _contact.text.trim();
    final address = _address.text.trim();
    if (!_phone.hasMatch(_compact(contact))) {
      await say('Enter a Philippine mobile number, for example 0917 123 4567');
      return;
    }
    if (address.isEmpty) {
      await say('Enter your address');
      return;
    }

    // 2) send it; the button is disabled while waiting, so a double tap cannot send twice
    setState(() => _saving = true);
    final result = await UpdateProfile().send(
      contact: contact,
      address: address,
      image: _newImage,
    );

    if (!mounted) return; // the user left the page while waiting
    setState(() => _saving = false);

    // 3) tell them what happened (the server's own words)
    if (result.ok) {
      await showSuccess(result.message, title: 'Profile saved');
      // 4) success: go back to the profile; `true` tells it to reload
      navigator.pop(true);
    } else {
      await showError(result.message, title: "Couldn't save changes");
    }
  }
}
