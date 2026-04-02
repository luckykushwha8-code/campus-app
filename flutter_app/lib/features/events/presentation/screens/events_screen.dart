import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class EventsScreen extends StatelessWidget {
  const EventsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final events = List.generate(
        10,
        (i) => ({
              'title': 'Event ${i + 1}',
              'date': 'Jan ${i + 1}, 2024',
              'location': 'Campus Hall ${i + 1}',
              'type': i % 2 == 0 ? 'Academic' : 'Cultural',
            }));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Events'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: ListView.builder(
        itemCount: events.length,
        itemBuilder: (context, index) {
          final event = events[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 120,
                  width: double.infinity,
                  color: Colors.blue.shade100,
                  child:
                      Icon(Icons.event, size: 48, color: Colors.blue.shade400),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Chip(label: Text(event['type'] as String)),
                      const SizedBox(height: 8),
                      Text(event['title'] as String,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text(event['date'] as String,
                          style: TextStyle(color: Colors.grey[600])),
                      Text(event['location'] as String,
                          style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: () {},
                        child: const Text('RSVP'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/create-event'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
