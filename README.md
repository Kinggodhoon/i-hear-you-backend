# Iger.run

A real-time multiplayer music guessing game backend built with Express.js, Socket.IO, and Redis. This server provides WebSocket connections, room management, and real-time synchronization for the [Iger.run](https://iger.run).

## 🎵 About the Game

I Hear You is a multiplayer music guessing game where players:
- Create or join rooms with up to 8 players
- Listen to YouTube video segments and guess song titles/artists
- Communicate via real-time chat and WebRTC voice chat
- Compete in real-time with scoring and leaderboards

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- Redis server running (for caching and room state)

### Installation

```bash
npm install
```

### Environment Setup

The application uses environment-based configuration. Create your environment files or set `NODE_ENV`:

- `NODE_ENV=development` - Uses development configuration
- `NODE_ENV=production` - Uses production configuration

### Development

```bash
# Start development server with hot reload
npm run start:test

# Start production server
npm start

```

## 🏗️ Architecture

### Tech Stack

- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express.js
- **Real-time Communication**: Socket.IO
- **Caching**: Redis
- **Validation**: Custom middleware with class-validator
- **Documentation**: Swagger with custom decorators

### Project Structure

```
src/
├── application/              # Business logic layer
│   ├── socket/              # WebSocket gateway and events
│   │   ├── socket.gateway.ts    # Main socket event handlers
│   │   └── socket.service.ts    # Socket utility services
│   ├── rooms/               # Room management
│   │   └── rooms.service.ts     # Room ID generation
│   ├── health/              # Health check endpoints
│   └── logger/              # Application logging
├── middleware/              # Express middleware
│   ├── parameter.validate.ts    # Custom validation with method chaining
│   ├── authorize.validate.ts    # Authorization middleware
│   └── response.ts             # Response formatting
├── decorator/               # Custom decorators
│   └── swagger/             # Swagger API documentation decorators
├── cache/                   # Redis caching service
├── config/                  # Environment-based configuration
│   ├── Config.ts            # Configuration factory
│   ├── Configuration.ts     # Base configuration interface
│   ├── Development.ts       # Development settings
│   └── Production.ts        # Production settings
└── types/                   # TypeScript definitions
```

## 🎮 Game Features

### Room Management
- **Create Room**: Generate unique room IDs for multiplayer sessions
- **Join Room**: Players can join existing rooms via room codes
- **Host Controls**: Room hosts can kick players, modify settings, and start games
- **Player Limit**: Configurable room capacity (up to 8 players)

### Real-time Communication
- **WebSocket Events**: Real-time room updates and game state synchronization
- **WebRTC Signaling**: Server-side signaling for P2P voice connections
- **Chat System**: Real-time text messaging during gameplay

### Socket Events

#### Room Events
```typescript
// Room lifecycle
CREATE_ROOM              // Host creates a new room
ENTER_ROOM               // Player joins existing room
EXIT_ROOM                // Player leaves room
START_GAME               // Host starts the game

// Room management
MODIFY_ROOM_MAX_PLAYER   // Change room capacity
MODIFY_ROOM_HOST_PLAYER  // Transfer host privileges
KICK_PLAYER              // Remove player from room
```

#### WebRTC Events
```typescript
// P2P connection signaling
SERVE_OFFER              // WebRTC offer exchange
SERVER_ANSWER            // WebRTC answer exchange
SERVE_CANDIDATE          // ICE candidate exchange
```

#### System Events
```typescript
PING                     // Connection health check
DISCONNECT/DISCONNECTING // Player disconnection handling
```

## 🔧 Configuration

### Environment Configuration

The application uses a factory pattern for environment-specific settings:

```typescript
// Automatic environment detection
const config = Config.getConfig();
console.log(config.PORT); // Environment-specific port
```

### Redis Integration

Room state and player data are managed through Redis:
- **Room Keys**: `room|{maxPlayers}|{hostId}|{roomId}`
- **Player Lists**: Cached player arrays per room
- **Real-time Updates**: Automatic cache invalidation on player actions

## 🛠️ Custom Features

### Parameter Validation
Custom middleware with method chaining for request validation:
```typescript
// Usage in routes
app.get('/api/rooms/:id',
  parameterValidate.required('id').isString(),
  roomController.getRoom
);
```

### Swagger Integration
Decorator-based API documentation (similar to NestJS):
```typescript
@ApiController('/rooms', 'Room Management')
export class RoomController {
  @ApiEndpoint('GET', '/:id', 'Get room details')
  async getRoom(req: Request, res: Response) {
    // Implementation
  }
}
```

### Error Handling
Structured error handling with custom exception types:
```typescript
throw new SocketException(404, 'Room not found');
```

## 🐳 Deployment

The project includes Docker configuration for containerized deployment:

```dockerfile
# Dockerfile available for production builds
```

## 📝 Development Notes

- **TypeScript**: Strict mode enabled with experimental decorators
- **ESLint**: Airbnb configuration with TypeScript support
- **Hot Reload**: Development server uses `ts-node-dev`
- **Production**: Uses `tsx` for optimized runtime
