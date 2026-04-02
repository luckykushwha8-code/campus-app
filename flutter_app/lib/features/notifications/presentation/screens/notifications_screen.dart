import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = List.generate(
        10,
        (i) => ({
              'title': i % 2 == 0 ? 'New follower' : 'New message',
              'subtitle': i % 2 == 0
                  ? 'User ${i + 1} followed you'
                  : 'User ${i + 1} sent you a message',
              'time': '${i + 1}h ago',
            }));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final notif = notifications[index];
          return ListTile(
            leading: CircleAvatar(
              backgroundImage:
                  NetworkImage('https://i.pravatar.cc/150?img=$index'),
            ),
            title: Text(notif['title'] as String),
            subtitle: Text(notif['subtitle'] as String),
            trailing: Text(notif['time'] as String,
                style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          );
        },
      ),
    );
  }
}
