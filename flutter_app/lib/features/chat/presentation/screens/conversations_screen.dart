import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ConversationsScreen extends StatelessWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chats'),
        actions: [
          IconButton(
            icon: const Icon(Icons.group_add),
            onPressed: () => context.push('/create-group'),
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: 15,
        itemBuilder: (context, index) {
          final isGroup = index % 3 == 0;
          return ListTile(
            leading: CircleAvatar(
              backgroundImage: NetworkImage(
                isGroup
                    ? 'https://i.pravatar.cc/150?img=50'
                    : 'https://i.pravatar.cc/150?img=${index + 20}',
              ),
            ),
            title: Text(isGroup ? 'Group ${index + 1}' : 'User ${index + 1}'),
            subtitle: Text(
              index % 2 == 0 ? 'Hey, how are you?' : 'Sent an attachment',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${index + 1}h ago',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
                if (index % 4 == 0)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      '2',
                      style: TextStyle(color: Colors.white, fontSize: 10),
                    ),
                  ),
              ],
            ),
            onTap: () => context.push('/chat/${index + 1}'),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/new-chat'),
        child: const Icon(Icons.message),
      ),
    );
  }
}
