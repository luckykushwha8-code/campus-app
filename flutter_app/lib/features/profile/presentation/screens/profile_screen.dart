import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../providers.dart';
import '../../../../services/auth_service.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.user;
    final isLoading = authState.status == AuthStatus.loading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundImage: user?.avatar != null
                        ? NetworkImage(user!.avatar!)
                        : const NetworkImage('https://i.pravatar.cc/150'),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user?.name ?? 'Student',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  Text(
                    user?.department ?? 'Department',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildStat('Posts', '42'),
                      const SizedBox(width: 24),
                      _buildStat('Followers', '156'),
                      const SizedBox(width: 24),
                      _buildStat('Following', '89'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: () => context.push('/edit-profile'),
                    child: const Text('Edit Profile'),
                  ),
                  const SizedBox(height: 24),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.note),
                    title: const Text('My Notes'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/notes'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.event),
                    title: const Text('My Events'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/my-events'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.work),
                    title: const Text('My Applications'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/applications'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.shopping_bag),
                    title: const Text('Marketplace'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/my-marketplace'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.help),
                    title: const Text('Lost & Found'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/my-lost-found'),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.logout, color: Colors.red),
                    title: const Text('Logout',
                        style: TextStyle(color: Colors.red)),
                    onTap: () async {
                      await ref.read(authNotifierProvider.notifier).logout();
                      if (context.mounted) {
                        context.go('/login');
                      }
                    },
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        Text(label, style: TextStyle(color: Colors.grey[600])),
      ],
    );
  }
}
