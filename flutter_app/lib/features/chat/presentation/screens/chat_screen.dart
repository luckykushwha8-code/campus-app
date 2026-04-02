import 'package:flutter/material.dart';

class ChatScreen extends StatefulWidget {
  final String conversationId;

  const ChatScreen({super.key, required this.conversationId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _messages = List.generate(
      10,
      (i) => _Message(
            id: i,
            text: i % 2 == 0
                ? 'Hey, how are you doing?'
                : 'I am good! Thanks for asking.',
            isMe: i % 2 == 1,
            time: '${i + 1}h ago',
          ));

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage(
                  'https://i.pravatar.cc/150?img=${int.tryParse(widget.conversationId) ?? 1}'),
            ),
            const SizedBox(width: 8),
            Text('User ${widget.conversationId}'),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: false,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return Align(
                  alignment:
                      msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: msg.isMe ? Colors.blue : Colors.grey[200],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(msg.text,
                            style: TextStyle(
                                color: msg.isMe ? Colors.white : Colors.black)),
                        const SizedBox(height: 4),
                        Text(msg.time,
                            style: TextStyle(
                                fontSize: 10,
                                color:
                                    msg.isMe ? Colors.white70 : Colors.grey)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.grey[300]!, blurRadius: 4)],
            ),
            child: Row(
              children: [
                IconButton(
                    icon: const Icon(Icons.attach_file), onPressed: () {}),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.blue),
                  onPressed: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Message {
  final int id;
  final String text;
  final bool isMe;
  final String time;

  _Message(
      {required this.id,
      required this.text,
      required this.isMe,
      required this.time});
}
