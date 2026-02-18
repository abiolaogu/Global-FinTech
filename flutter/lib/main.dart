import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

void main() {
  runApp(const ProviderScope(child: App()));
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      routes: [
        GoRoute(
          path: '/',
          builder: (_, __) => const ProjectsPage(),
        ),
      ],
    );

    return MaterialApp.router(
      title: 'Flutter Reference',
      routerConfig: router,
      theme: ThemeData(useMaterial3: true),
    );
  }
}

class ProjectsPage extends StatefulWidget {
  const ProjectsPage({super.key});

  @override
  State<ProjectsPage> createState() => _ProjectsPageState();
}

class _ProjectsPageState extends State<ProjectsPage> {
  final items = <String>['Apollo', 'Atlas'];
  bool loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Projects')),
      body: AnimatedOpacity(
        opacity: loading ? 0.4 : 1,
        duration: const Duration(milliseconds: 220),
        child: ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) => ListTile(title: Text(items[index])),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => loading = !loading),
        child: const Icon(Icons.add),
      ),
    );
  }
}
