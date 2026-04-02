import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class RoomsScreen extends ConsumerWidget {
  const RoomsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rooms = [
      {'name': 'CS Department', 'type': 'department', 'members': 450},
      {'name': '2025 Batch', 'type': 'batch', 'members': 320},
      {'name': 'Tech Club', 'type': 'club', 'members': 180},
      {'name': 'Placement Cell', 'type': 'placement', 'members': 290},
      {'name': 'Hostel A', 'type': 'hostel', 'members': 200},
      {'name': 'Book Exchange', 'type': 'buysell', 'members': 150},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Campus Rooms'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/create-room'),
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: rooms.length,
        itemBuilder: (context, index) {
          final room = rooms[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.blue.shade100,
                child: Icon(
                  _getRoomIcon(room['type'] as String),
                  color: Colors.blue,
                ),
              ),
              title: Text(room['name'] as String),
              subtitle: Text('${room['members']} members'),
              trailing: OutlinedButton(
                onPressed: () => context.push('/room/${index + 1}'),
                child: const Text('Join'),
              ),
            ),
          );
        },
      ),
    );
  }

  IconData _getRoomIcon(String type) {
    switch (type) {
      case 'department':
        return Icons.school;
      case 'batch':
        return Icons.groups;
      case 'club':
        return Icons.emoji_events;
      case 'placement':
        return Icons.work;
      case 'hostel':
        return Icons.hotel;
      case 'buysell':
        return Icons.store;
      default:
        return Icons.chat;
    }
  }
}
