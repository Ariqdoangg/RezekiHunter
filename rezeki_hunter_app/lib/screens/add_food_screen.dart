import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dotted_border/dotted_border.dart';
import '../config/constants.dart';
import '../services/api_service.dart';

class AddFoodScreen extends StatefulWidget {
  const AddFoodScreen({super.key});

  @override
  State<AddFoodScreen> createState() => _AddFoodScreenState();
}

class _AddFoodScreenState extends State<AddFoodScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _selectedLocation;
  File? _image;
  bool _loading = false;

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 70, maxWidth: 1024);
    if (picked != null) {
      setState(() => _image = File(picked.path));
    }
  }

  void _showImagePicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.grayMuted, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 24),
            Text('Add Photo', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.dark)),
            const SizedBox(height: 6),
            Text('Choose how to add your food photo', style: TextStyle(fontSize: 13, color: AppColors.gray)),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(child: _imageOptionBtn(Icons.camera_alt_rounded, 'Camera', () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                })),
                const SizedBox(width: 12),
                Expanded(child: _imageOptionBtn(Icons.photo_library_rounded, 'Gallery', () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                })),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _imageOptionBtn(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: AppColors.bg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.tealSoft,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, size: 22, color: AppColors.teal),
            ),
            const SizedBox(height: 10),
            Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.dark)),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedLocation == null) {
      _showSnack('Please select a location', AppColors.red);
      return;
    }

    setState(() => _loading = true);

    try {
      await ApiService().postFood(
        title: _titleCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        location: _selectedLocation!,
        image: _image,
      );

      if (!mounted) return;
      _showSnack('Food posted! Jazakallah! 🤲', AppColors.teal);
      _titleCtrl.clear();
      _descCtrl.clear();
      setState(() { _selectedLocation = null; _image = null; });
    } catch (e) {
      if (mounted) _showSnack('Failed to post. Try again.', AppColors.red);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showSnack(String text, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(text, style: const TextStyle(fontWeight: FontWeight.w600)),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),

              // Header
              const Text(
                'Share Food',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.dark, letterSpacing: -0.5),
              ),
              const SizedBox(height: 4),
              Text(
                'Help fellow students — post your leftover food',
                style: TextStyle(fontSize: 13, color: AppColors.gray),
              ),
              const SizedBox(height: 28),

              // ── Dashed Photo Picker ──
              GestureDetector(
                onTap: _showImagePicker,
                child: _image != null ? _imagePreview() : _dashedPicker(),
              ),
              const SizedBox(height: 24),

              // ── Food Title ──
              _label('Food Title'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _titleCtrl,
                style: const TextStyle(fontSize: 14, color: AppColors.dark, fontWeight: FontWeight.w500),
                decoration: _outlinedInput('e.g. Nasi Lemak Lebih Event', Icons.restaurant_rounded),
                validator: (v) => v!.isEmpty ? 'Title required' : null,
              ),
              const SizedBox(height: 20),

              // ── Description ──
              _label('Description'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descCtrl,
                maxLines: 3,
                style: const TextStyle(fontSize: 14, color: AppColors.dark),
                decoration: _outlinedInput('Describe the food, quantity, etc.', null),
                validator: (v) => v!.isEmpty ? 'Description required' : null,
              ),
              const SizedBox(height: 20),

              // ── Location ──
              _label('Location'),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedLocation,
                decoration: _outlinedInput('Select campus location', Icons.location_on_rounded),
                items: CampusLocations.locations.map((loc) =>
                  DropdownMenuItem(value: loc, child: Text(loc, style: const TextStyle(fontSize: 14))),
                ).toList(),
                onChanged: (v) => setState(() => _selectedLocation = v),
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.gray),
                dropdownColor: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              const SizedBox(height: 32),

              // ── Submit ──
              SizedBox(
                width: double.infinity,
                height: 52,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: const LinearGradient(colors: [AppColors.teal, AppColors.tealLight]),
                    boxShadow: [BoxShadow(color: AppColors.tealLight.withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: ElevatedButton.icon(
                    onPressed: _loading ? null : _submit,
                    icon: _loading ? const SizedBox.shrink() : const Icon(Icons.send_rounded, size: 18),
                    label: _loading
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                        : const Text('Post Food', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent, foregroundColor: Colors.white,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // ── Dashed border photo area ──
  Widget _dashedPicker() {
    return DottedBorder(
      color: AppColors.grayMuted,
      strokeWidth: 1.5,
      dashPattern: const [8, 5],
      borderType: BorderType.RRect,
      radius: const Radius.circular(16),
      child: Container(
        width: double.infinity,
        height: 160,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                color: AppColors.tealSoft,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.camera_alt_rounded, color: AppColors.teal, size: 24),
            ),
            const SizedBox(height: 12),
            const Text('Add Photo', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark)),
            const SizedBox(height: 3),
            Text('Tap to upload tasty food', style: TextStyle(fontSize: 12, color: AppColors.grayLight)),
          ],
        ),
      ),
    );
  }

  // ── Image preview with remove button ──
  Widget _imagePreview() {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.file(
            _image!,
            height: 200,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
        ),
        Positioned(
          top: 10,
          right: 10,
          child: GestureDetector(
            onTap: () => setState(() => _image = null),
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.close_rounded, color: Colors.white, size: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _label(String t) => Text(t, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.dark));

  InputDecoration _outlinedInput(String hint, IconData? icon) => InputDecoration(
    hintText: hint,
    hintStyle: TextStyle(color: AppColors.grayLight, fontSize: 14),
    prefixIcon: icon != null ? Icon(icon, color: AppColors.grayLight, size: 20) : null,
    filled: false,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.tealLight, width: 1.5)),
    errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.red.withOpacity(0.5))),
  );
}
