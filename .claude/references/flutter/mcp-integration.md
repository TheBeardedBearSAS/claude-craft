# Model Context Protocol (MCP) Integration - Flutter 3.41+

## Overview

Le **Model Context Protocol (MCP)** est un standard ouvert pour l'intégration d'assistants AI dans les applications. Flutter 3.41+ offre un support natif pour créer des applications qui interagissent avec des AI assistants comme Claude.

**Cas d'usage:**
- Assistants conversationnels intégrés
- Génération de contenu contextuel
- Outils de productivité AI-powered
- Interfaces de chat avec LLMs

## Installation

### Dépendances

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # Client MCP officiel
  mcp_client: ^1.0.0

  # Transport WebSocket
  web_socket_channel: ^2.4.0

  # Streaming pour réponses longues
  async: ^2.11.0

  # Parsing Markdown
  flutter_markdown: ^0.6.22
```

## Architecture MCP

### Concepts Clés

```
┌─────────────────────────────────────────────────────────────┐
│                    Flutter App (Host)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   MCP Client                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │   │
│  │  │ Resources │  │   Tools   │  │    Prompts    │   │   │
│  │  └───────────┘  └───────────┘  └───────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                    Transport (WebSocket/HTTP)               │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   MCP Server    │
                   │  (Claude, etc.) │
                   └─────────────────┘
```

## Configuration Client

### MCP Client Setup

```dart
import 'package:mcp_client/mcp_client.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class McpClientService {
  late final McpClient _client;
  final String _serverUrl;

  McpClientService({required String serverUrl}) : _serverUrl = serverUrl;

  Future<void> initialize() async {
    // Créer le transport WebSocket
    final channel = WebSocketChannel.connect(Uri.parse(_serverUrl));

    // Initialiser le client MCP
    _client = McpClient(
      transport: WebSocketTransport(channel),
      clientInfo: ClientInfo(
        name: 'MyFlutterApp',
        version: '1.0.0',
      ),
    );

    // Négociation des capacités
    await _client.initialize();

    // Lister les capacités du serveur
    final capabilities = await _client.getServerCapabilities();
    print('Server supports: $capabilities');
  }

  Future<void> close() async {
    await _client.close();
  }
}
```

### Configuration avec Provider/Riverpod

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'mcp_providers.g.dart';

@riverpod
class McpClientNotifier extends _$McpClientNotifier {
  @override
  Future<McpClient> build() async {
    final client = McpClientService(
      serverUrl: 'wss://mcp.example.com/v1',
    );
    await client.initialize();

    // Cleanup on dispose
    ref.onDispose(() => client.close());

    return client._client;
  }
}
```

## Conversation avec l'AI

### Message Streaming

```dart
import 'dart:async';
import 'package:mcp_client/mcp_client.dart';

class ChatService {
  final McpClient _client;

  ChatService(this._client);

  /// Envoie un message et stream la réponse.
  Stream<String> sendMessage(String userMessage) async* {
    final request = CreateMessageRequest(
      messages: [
        Message(role: Role.user, content: userMessage),
      ],
      maxTokens: 1024,
    );

    // Stream la réponse token par token
    await for (final chunk in _client.createMessageStream(request)) {
      if (chunk.content != null) {
        yield chunk.content!;
      }
    }
  }

  /// Conversation avec contexte.
  Stream<String> chat(List<Message> history, String newMessage) async* {
    final messages = [
      ...history,
      Message(role: Role.user, content: newMessage),
    ];

    final request = CreateMessageRequest(
      messages: messages,
      maxTokens: 2048,
    );

    await for (final chunk in _client.createMessageStream(request)) {
      if (chunk.content != null) {
        yield chunk.content!;
      }
    }
  }
}
```

### Widget de Chat

```dart
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ChatPage extends ConsumerStatefulWidget {
  const ChatPage({super.key});

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  final _controller = TextEditingController();
  final _messages = <ChatMessage>[];
  String _currentResponse = '';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Assistant')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length + (_currentResponse.isNotEmpty ? 1 : 0),
              itemBuilder: (context, index) {
                if (index < _messages.length) {
                  return _buildMessageTile(_messages[index]);
                }
                // Message en cours de streaming
                return _buildStreamingMessage();
              },
            ),
          ),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessageTile(ChatMessage message) {
    final isUser = message.role == .user;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.all(8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isUser ? Colors.blue[100] : Colors.grey[200],
          borderRadius: BorderRadius.circular(12),
        ),
        child: MarkdownBody(data: message.content),
      ),
    );
  }

  Widget _buildStreamingMessage() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.all(8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MarkdownBody(data: _currentResponse),
            const SizedBox(height: 4),
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                decoration: const InputDecoration(
                  hintText: 'Posez votre question...',
                  border: OutlineInputBorder(),
                ),
                enabled: !_isLoading,
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: _isLoading
                  ? const CircularProgressIndicator()
                  : const Icon(Icons.send),
              onPressed: _isLoading ? null : _sendMessage,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(ChatMessage(role: .user, content: text));
      _controller.clear();
      _isLoading = true;
      _currentResponse = '';
    });

    try {
      final chatService = ref.read(chatServiceProvider);

      await for (final chunk in chatService.sendMessage(text)) {
        setState(() {
          _currentResponse += chunk;
        });
      }

      setState(() {
        _messages.add(ChatMessage(role: .assistant, content: _currentResponse));
        _currentResponse = '';
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

class ChatMessage {
  final Role role;
  final String content;

  const ChatMessage({required this.role, required this.content});
}

enum Role { user, assistant }
```

## Outils MCP

### Définir des Outils Personnalisés

```dart
import 'package:mcp_client/mcp_client.dart';

class WeatherTool implements McpTool {
  @override
  String get name => 'get_weather';

  @override
  String get description => 'Get current weather for a location';

  @override
  Map<String, dynamic> get inputSchema => {
    'type': 'object',
    'properties': {
      'location': {
        'type': 'string',
        'description': 'City name or coordinates',
      },
    },
    'required': ['location'],
  };

  @override
  Future<ToolResult> execute(Map<String, dynamic> arguments) async {
    final location = arguments['location'] as String;

    // Appeler une API météo
    final weather = await _fetchWeather(location);

    return ToolResult(
      content: 'Weather in $location: ${weather.temperature}°C, ${weather.condition}',
    );
  }
}
```

### Enregistrer les Outils

```dart
class McpClientWithTools {
  final McpClient _client;
  final List<McpTool> _tools;

  McpClientWithTools(this._client, this._tools);

  Future<void> registerTools() async {
    for (final tool in _tools) {
      await _client.registerTool(tool);
    }
  }

  Future<void> handleToolCall(ToolCall call) async {
    final tool = _tools.firstWhere((t) => t.name == call.name);
    final result = await tool.execute(call.arguments);
    await _client.submitToolResult(call.id, result);
  }
}
```

## Ressources MCP

### Exposer des Ressources

```dart
import 'package:mcp_client/mcp_client.dart';

class DocumentResource implements McpResource {
  @override
  String get uri => 'document://current';

  @override
  String get name => 'Current Document';

  @override
  String get mimeType => 'text/plain';

  @override
  Future<String> read() async {
    // Retourner le contenu du document actuel
    return _documentController.currentDocument.content;
  }
}

// Enregistrer la ressource
await client.registerResource(DocumentResource());
```

### Lire des Ressources du Serveur

```dart
Future<void> fetchServerResources() async {
  // Lister les ressources disponibles
  final resources = await _client.listResources();

  for (final resource in resources) {
    print('Resource: ${resource.name} (${resource.uri})');
  }

  // Lire une ressource spécifique
  final content = await _client.readResource('config://app-settings');
  print('Content: $content');
}
```

## Gestion des Erreurs

### Error Handling Robuste

```dart
class SafeChatService {
  final McpClient _client;

  Stream<ChatEvent> sendMessageSafely(String message) async* {
    try {
      yield ChatEvent.loading();

      await for (final chunk in _sendMessage(message)) {
        yield ChatEvent.chunk(chunk);
      }

      yield ChatEvent.complete();
    } on McpConnectionException catch (e) {
      yield ChatEvent.error('Connexion perdue: ${e.message}');
    } on McpTimeoutException catch (e) {
      yield ChatEvent.error('Timeout: veuillez réessayer');
    } on McpRateLimitException catch (e) {
      yield ChatEvent.error('Limite atteinte. Réessayez dans ${e.retryAfter}s');
    } catch (e) {
      yield ChatEvent.error('Erreur inattendue: $e');
    }
  }
}

sealed class ChatEvent {
  const ChatEvent();

  factory ChatEvent.loading() = LoadingEvent;
  factory ChatEvent.chunk(String text) = ChunkEvent;
  factory ChatEvent.complete() = CompleteEvent;
  factory ChatEvent.error(String message) = ErrorEvent;
}

class LoadingEvent extends ChatEvent {}
class ChunkEvent extends ChatEvent {
  final String text;
  const ChunkEvent(this.text);
}
class CompleteEvent extends ChatEvent {}
class ErrorEvent extends ChatEvent {
  final String message;
  const ErrorEvent(this.message);
}
```

## Bonnes Pratiques

### 1. Streaming pour UX Fluide

```dart
// ✅ BON - Streaming progressif
await for (final chunk in client.createMessageStream(request)) {
  updateUI(chunk);
}

// ❌ MAUVAIS - Attendre la réponse complète
final response = await client.createMessage(request);
updateUI(response);
```

### 2. Contexte Limité

```dart
// ✅ BON - Garder un historique limité
const maxHistoryLength = 10;
if (messages.length > maxHistoryLength) {
  messages.removeRange(0, messages.length - maxHistoryLength);
}

// ❌ MAUVAIS - Historique illimité (coûteux)
messages.add(newMessage);  // Sans limite
```

### 3. Annulation de Requêtes

```dart
class CancelableChatService {
  CancelableOperation<String>? _currentOperation;

  Future<String> sendMessage(String message) async {
    // Annuler la requête précédente
    await _currentOperation?.cancel();

    _currentOperation = CancelableOperation.fromFuture(
      _client.createMessage(request),
    );

    return _currentOperation!.value;
  }

  void cancel() {
    _currentOperation?.cancel();
  }
}
```

## Sécurité

### Authentification

```dart
class SecureMcpClient {
  Future<McpClient> connect(String apiKey) async {
    final transport = WebSocketTransport(
      WebSocketChannel.connect(
        Uri.parse(_serverUrl),
        headers: {
          'Authorization': 'Bearer $apiKey',
        },
      ),
    );

    return McpClient(transport: transport);
  }
}
```

### Stockage Sécurisé des Clés

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiKeyStorage {
  final _storage = const FlutterSecureStorage();

  Future<void> saveApiKey(String key) async {
    await _storage.write(key: 'mcp_api_key', value: key);
  }

  Future<String?> getApiKey() async {
    return _storage.read(key: 'mcp_api_key');
  }
}
```

## Ressources

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Anthropic MCP Docs](https://code.claude.com/docs/en/mcp)
- [Flutter WebSocket](https://pub.dev/packages/web_socket_channel)

---

**Date de dernière mise à jour:** 2026-01-29
**Version:** 1.0.0
