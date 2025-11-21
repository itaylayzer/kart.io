# Authoritative Server Architecture

## Overview
This document describes the implementation of an authoritative server for kart.io, where the server has full control over game state including movement, race completion, mystery boxes, and all game mechanics.

## Current State (wip-authorative-server branch)

### What's Already Implemented
1. **Basic Tick System Structure**
   - `SyncedMovementController` on server - handles input queue and basic movement
   - `PredictionController` on client - handles client prediction and reconciliation
   - Basic input/output payloads defined in `shared/types/payloads.ts`

2. **Server-Side Controllers**
   - `DriverController` - Server-side movement controller (incomplete)
   - `SyncedMovementController` - Basic tick-based movement handler
   - `TrackerController` - Tracks player position on road

3. **Client-Side Prediction**
   - `PredictionController` - Client-side prediction with reconciliation
   - Input buffering system
   - State buffering for reconciliation

### What's Missing
1. **Full Server Authority**
   - Movement is not fully server-controlled (client still sends transform updates)
   - Race completion logic is client-triggered
   - Mystery boxes are client-triggered
   - Items/mysteries are not server-validated

2. **Proper Tick System**
   - Server doesn't have fixed timestep simulation
   - No proper tick synchronization
   - Input handling is not properly queued and processed

3. **Complete Movement Logic**
   - Server `DriverController` exists but is not fully integrated
   - Physics simulation needs to be server-authoritative
   - Ground alignment, steering, drift, turbo, rocket, mushroom all need server control

## Architecture Design

### Server-Side Tick System

```
Server Tick Loop (60Hz or 20Hz)
├── Process Input Queue (from all clients)
├── Update Physics World
├── Update All Player Entities
│   ├── Apply Input
│   ├── Update Movement (DriveController)
│   ├── Update Tracker
│   └── Update Physics
├── Check Game State (finish line, mystery boxes)
└── Send State Updates to Clients
```

### Client-Side Prediction

```
Client Update Loop
├── Collect Input (every frame)
├── Client Prediction (apply input locally)
├── Send Input to Server (on tick)
├── Receive Server State
├── Reconciliation (if position differs)
│   ├── Rewind to server state
│   └── Re-apply unprocessed inputs
└── Render Interpolated Position
```

### Message Flow

**Client → Server:**
- `CS.INPUT_BUFFER` - Input payload with tick number
- `CS.TOUCH_MYSTERY` - Mystery box interaction (server validates)
- `CS.READY` - Player ready status
- `CS.APPLY_MYSTERY` - Item usage (server validates)

**Server → Client:**
- `CC.STATE_BUFFER` - Authoritative state with tick number
- `CC.POSITION_UPDATE` - Position updates for other players
- `CC.MYSTERY_ITEM` - Mystery box item received
- `CC.FINISH_LINE` - Race completion (server-authoritative)
- `CC.SHOW_WINNERS` - Winners screen (server-authoritative)

## Implementation Status

### ✅ Phase 1: Server Tick System (COMPLETED)
1. ✅ Implemented fixed timestep simulation in `KartScene` (60Hz physics)
2. ✅ Added tick counter in `SyncedMovementController`
3. ✅ Process input queue on each tick (20Hz state updates)
4. ✅ Send state updates to clients via `CC.STATE_BUFFER`

### ✅ Phase 2: Server-Authoritative Movement (COMPLETED)
1. ✅ Refactored `DriveController` to accept `InputPayload` instead of keyboard
2. ✅ Server controls all physics and movement
3. ✅ Server sends authoritative position/rotation/velocity via `StatePayload`
4. ✅ Removed dependency on client-side keyboard input

### ✅ Phase 3: Client Prediction (COMPLETED)
1. ✅ Implemented client prediction in `PredictionController`
2. ✅ Added reconciliation system with position error threshold (0.001)
3. ✅ Input buffering with 1024 tick buffer
4. ✅ State buffering for reconciliation

### 🔄 Phase 4: Game State Authority (IN PROGRESS)
1. ⚠️ Finish line detection - needs server-side implementation
2. ⚠️ Mystery box spawning/despawning - needs server-side timer
3. ⚠️ Item usage validation - needs server-side validation
4. ⚠️ Winner determination - needs server-side logic

## Implementation Details

### Server-Side Changes

#### `DriverController.ts`
- Refactored to accept `InputPayload | null` instead of keyboard
- All movement logic (steering, drift, turbo, rocket, mushroom) now server-controlled
- Added `setGameStarted()` method to enable/disable movement

#### `SyncedMovementController.ts`
- Manages input queue and processes inputs in order
- Creates `StatePayload` with position, quaternion, velocity, and state flags
- Sends state updates to clients on each tick

#### `KartRace.ts`
- Added `movementControllers` map to track each player's controller
- Handles `CS.INPUT_BUFFER` messages from clients
- Sets up `setSimulationInterval` at 60Hz for physics
- Sends `CC.STATE_BUFFER` to owning client and `CC.POSITION_UPDATE` to others
- Game starts after 5 second countdown

#### `PlayerEntity.ts`
- Exposed `engine` as public for `SyncedMovementController` access
- Removed direct engine update from entity update loop
- Tracker and physics matching still handled in update loop

### Client-Side Changes

#### `PredictionController.ts`
- Updated to use new `InputPayload` format (horizontal, vertical, drift)
- Collects inputs every frame, averages them per tick
- Simplified prediction (server does real physics)
- Enhanced reconciliation with quaternion and velocity support

#### Message Codes
- Added `CS.INPUT_BUFFER` for client input
- Added `CC.STATE_BUFFER` for server state
- Added `CC.POSITION_UPDATE` for other players

### Payload Changes

#### `InputPayload`
```typescript
{
    tick: number;
    horizontal: number;  // -1 to 1
    vertical: number;     // -1 to 1
    drift: boolean;       // Space bar
}
```

#### `StatePayload`
```typescript
{
    tick: number;
    position: Vector3Like;
    quaternion: QuaternionLike;
    velocity: Vector3Like;
    turboMode: boolean;
    rocketMode: boolean;
    driftSide: number;
    mushroomAddon: number;
}
```

## Remaining Work

### Finish Line Detection
- Server should detect when players cross finish line
- Validate lap count (3 laps)
- Set `finished` flag in player schema
- Send `CC.FINISH_LINE` to all clients
- Determine winners when all players finish

### Mystery Boxes
- Server should manage mystery box respawn timers
- Validate mystery box interactions
- Server determines item received (not client)
- Update mystery box visibility in state

### Item Usage
- Server should validate item usage (turbo, rocket, mushroom, etc.)
- Check if player actually has the item
- Apply item effects server-side
- Broadcast item usage to all clients

### Testing
- Test with multiple clients
- Test reconciliation with network lag
- Test input prediction accuracy
- Test finish line detection
- Test mystery box interactions

## Key Files

### Server
- `server/src/rooms/KartRace.ts` - Main room logic, tick system
- `server/src/scenes/KartScene.ts` - Physics simulation
- `server/src/controllers/DriverController.ts` - Movement controller
- `server/src/controllers/SyncedMovementController.ts` - Tick-based input handler
- `server/src/entities/PlayerEntity.ts` - Player entity with physics

### Client
- `frontend/src/game/controller/PredictionController.ts` - Client prediction
- `frontend/src/systems/InputSystem.ts` - Input collection
- `frontend/src/game/player/Player.ts` - Client player representation

### Shared
- `shared/types/payloads.ts` - Input/State payloads
- `shared/types/codes.ts` - Message codes

## Reference: tennis.io Implementation

The tennis.io project has a working tick system:
- `backend/src/rooms/FifaRoom.ts` - Uses `setSimulationInterval` for fixed timestep
- `backend/src/entities/Player.ts` - `SyncedMovementController` handles input queue
- `frontend/src/controllers/PredictionController.ts` - Client prediction with reconciliation

Key differences for kart.io:
- More complex physics (CANNON.js)
- More complex movement (steering, drift, turbo, etc.)
- Road tracking system
- Mystery boxes and items
- Race completion logic

## Notes

- Server tick rate: 20Hz (50ms per tick) - matches tennis.io
- Client prediction: Runs at display framerate, sends inputs at server tick rate
- Buffer size: 1024 ticks (matches tennis.io)
- Reconciliation threshold: 0.001 units (position difference)

