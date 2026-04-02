import 'package:flutter/material.dart';

class NotesScreen extends StatelessWidget {
  const NotesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notes = List.generate(
        10,
        (i) => ({
              'title': 'Note ${i + 1}',
              'subject': 'Subject ${i + 1}',
              'date': '2024-01-${i + 1}',
            }));

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Notes'),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () {}),
        ],
      ),
      body: ListView.builder(
        itemCount: notes.length,
        itemBuilder: (context, index) {
          final note = notes[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ListTile(
              title: Text(note['title'] as String),
              subtitle: Text(note['subject'] as String),
              trailing: Text(note['date'] as String,
                  style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              onTap: () {},
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
