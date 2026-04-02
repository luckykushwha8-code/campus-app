import 'package:flutter/material.dart';

class LostFoundScreen extends StatefulWidget {
  const LostFoundScreen({super.key});

  @override
  State<LostFoundScreen> createState() => _LostFoundScreenState();
}

class _LostFoundScreenState extends State<LostFoundScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lostItems = List.generate(
        5,
        (i) => ({
              'title': 'Lost Item ${i + 1}',
              'description': 'Lost in campus area',
              'date': '2024-01-${i + 1}',
              'contact': '9*********',
            }));

    final foundItems = List.generate(
        5,
        (i) => ({
              'title': 'Found Item ${i + 1}',
              'description': 'Found in library',
              'date': '2024-01-${i + 1}',
              'contact': '9*********',
            }));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lost & Found'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Lost'),
            Tab(text: 'Found'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          ListView.builder(
            itemCount: lostItems.length,
            itemBuilder: (context, index) {
              final item = lostItems[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.search)),
                  title: Text(item['title'] as String),
                  subtitle: Text(item['description'] as String),
                  trailing: Text(item['date'] as String),
                  onTap: () {},
                ),
              );
            },
          ),
          ListView.builder(
            itemCount: foundItems.length,
            itemBuilder: (context, index) {
              final item = foundItems[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.check_circle)),
                  title: Text(item['title'] as String),
                  subtitle: Text(item['description'] as String),
                  trailing: Text(item['date'] as String),
                  onTap: () {},
                ),
              );
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
