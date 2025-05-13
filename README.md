# MCP Manager

A meta-tool for monitoring, maintaining, and managing Claude Desktop MCP servers.

**Status**: Pre-alpha - conceptual architecture established, not yet implemented or tested.

## Overview

MCP Manager is part of the [CogentEcho.ai](https://github.com/gregmulvihill/orchestrate-ai) ecosystem, serving as an automated maintenance and monitoring system for Claude Desktop MCP servers. It provides real-time health monitoring, automated troubleshooting, and a visual dashboard of your MCP infrastructure.

## Ecosystem Integration

This repository is part of the CogentEcho.ai three-tier ecosystem:

1. **Strategic Layer**: [Orchestrate-AI](https://github.com/gregmulvihill/orchestrate-ai) - Strategic orchestration and business logic
2. **Tactical Layer**: [Automated-Dev-Agents](https://github.com/gregmulvihill/automated-dev-agents) - Tactical task execution through specialized agents
3. **Foundation Layer**: [Multi-Tiered Memory Architecture](https://github.com/gregmulvihill/multi-tiered-memory-architecture) - Memory services for persistence and context preservation

MCP Manager interfaces with all three layers:
- Uses strategic insights from Orchestrate-AI to prioritize maintenance tasks
- Delegates specific repair operations to Automated-Dev-Agents
- Stores metrics, status, and configuration history in Multi-Tiered Memory Architecture

## Core Features

- **Automated Auditing**: Regular health checks of all MCP servers
- **Configuration Management**: Validates and fixes configuration issues
- **Error Recovery**: Automatically identifies and resolves common problems
- **Update Management**: Handles updates and dependency management
- **Performance Monitoring**: Tracks resource usage and response times
- **Visual Dashboard**: Real-time status visualization of your MCP ecosystem

## Architecture

MCP Manager follows a modular design with four main components:

1. **Introspection Engine**: Deep analysis of MCP server behavior and health
2. **Service Orchestrator**: Manages the lifecycle of MCP servers
3. **Configuration Manager**: Securely modifies and validates configurations
4. **Error Recovery System**: Identifies and automatically fixes common issues

See the [architecture documentation](docs/architecture/README.md) for detailed design information.

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Access to Claude Desktop configuration
- Read/write permissions for Claude Desktop files

### Installation

```bash
# Clone the repository
git clone https://github.com/gregmulvihill/mcp-manager.git
cd mcp-manager

# Install dependencies
npm install

# Configure
cp config/example.config.json config/config.json
# Edit config.json with your settings

# Run with Docker
docker-compose up
```

## Dashboard

The MCP Manager dashboard provides a visual overview of your MCP ecosystem:

- Real-time status of each MCP service
- Historical performance metrics
- Configuration validation results
- Error logs and recovery actions
- Update notifications

Access the dashboard at http://localhost:8080 after starting the service.

## Development

This project is in pre-alpha status and actively seeking contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Run tests
npm test

# Lint code
npm run lint
```

## Integration with Claude Desktop

MCP Manager needs access to:

1. Claude Desktop configuration files
2. MCP server log files
3. Process information for running MCP servers

See [Integration Guide](docs/integrations/claude-desktop.md) for detailed setup instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.