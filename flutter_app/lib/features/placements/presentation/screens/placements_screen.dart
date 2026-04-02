import 'package:flutter/material.dart';

class PlacementsScreen extends StatelessWidget {
  const PlacementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final jobs = List.generate(
        10,
        (i) => ({
              'company': 'Company ${i + 1}',
              'role': i % 2 == 0 ? 'Software Engineer' : 'Data Analyst',
              'package': '${(i + 1) * 5}LPA',
              'location': 'Bangalore',
              'type': i % 2 == 0 ? 'Full-time' : 'Internship',
            }));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Placements'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: ListView.builder(
        itemCount: jobs.length,
        itemBuilder: (context, index) {
          final job = jobs[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.blue.shade100,
                        child: Text(job['company']![0],
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(job['company'] as String,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            Text(job['role'] as String,
                                style: TextStyle(color: Colors.grey[600])),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.currency_rupee,
                          size: 16, color: Colors.grey[600]),
                      Text(job['package'] as String,
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 16),
                      Icon(Icons.location_on,
                          size: 16, color: Colors.grey[600]),
                      Text(job['location'] as String),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Chip(label: Text(job['type'] as String)),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {},
                      child: const Text('Apply'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
