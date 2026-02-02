import 'dart:io';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import 'auth_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = AuthService().token;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  late final Dio _dio;

  // ─── AUTH ────────────────────────────────
  Future<Response> login(String email, String password) async {
    return await _dio.post('/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register(String name, String email, String password) async {
    return await _dio.post('/register', data: {
      'name': name,
      'email': email,
      'password': password,
      'password_confirmation': password,
    });
  }

  Future<void> logout() async {
    try {
      await _dio.post('/logout');
    } catch (_) {}
    await AuthService().clearSession();
  }

  Future<Response> getUser() async {
    return await _dio.get('/user');
  }

  // ─── FOODS ───────────────────────────────
  Future<Response> getFoods() async {
    return await _dio.get('/foods');
  }

  Future<Response> getMyFoods() async {
    return await _dio.get('/my-foods');
  }

  Future<Response> getStats() async {
    return await _dio.get('/foods/stats');
  }

  Future<Response> claimFood(int id) async {
    return await _dio.post('/foods/$id/claim');
  }

  Future<Response> postFood({
    required String title,
    required String description,
    required String location,
    File? image,
  }) async {
    final formData = FormData.fromMap({
      'title': title,
      'description': description,
      'location': location,
      if (image != null)
        'image': await MultipartFile.fromFile(
          image.path,
          filename: 'food_${DateTime.now().millisecondsSinceEpoch}.jpg',
        ),
    });

    return await _dio.post(
      '/foods',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
  }
}
