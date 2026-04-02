import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MarketplaceScreen extends StatelessWidget {
  const MarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = List.generate(
        10,
        (i) => ({
              'title': 'Item ${i + 1}',
              'price': '₹${(i + 1) * 500}',
              'category': i % 3 == 0
                  ? 'Books'
                  : (i % 3 == 1 ? 'Electronics' : 'Others'),
              'image': 'https://picsum.photos/200?random=$i',
            }));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Marketplace'),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () {}),
        ],
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.75,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return Card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                    child: Center(
                        child: Icon(Icons.image,
                            size: 48, color: Colors.grey[400])),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['title'] as String,
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text(item['price'] as String,
                          style: const TextStyle(color: Colors.blue)),
                      Chip(
                          label: Text(item['category'] as String,
                              style: const TextStyle(fontSize: 10))),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/create-listing'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
