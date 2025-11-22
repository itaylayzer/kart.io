# Reconciliation Architecture

## Overview

The authoritative server system uses **client-side prediction with server reconciliation** for the local player, and **simple interpolation** for other players.

## Key Principle

**Only the LOCAL PLAYER reconciles with server state. Other players are simply interpolated.**

## Local Player (Reconciliation)

### Flow
1. Client predicts movement locally using `PredictionController`
2. Client sends inputs via `CS.INPUT_BUFFER` to server
3. Server processes inputs and sends authoritative state via `CC.STATE_BUFFER`
4. Client receives `CC.STATE_BUFFER` and reconciles:
   - Compares predicted position with server position
   - If difference > 0.001, rewinds to server state
   - Re-applies all unprocessed inputs from that point forward
5. Client renders predicted position (smooth, responsive)

### Implementation
- `PredictionController` handles all reconciliation logic
- Stores input buffer (1024 ticks) and state buffer (1024 ticks)
- Reconciliation happens in `handleServerReconciliation()`
- Called automatically when new server state received

## Other Players (Interpolation Only)

### Flow
1. Server sends `CC.POSITION_UPDATE` for other players
2. Client receives position/rotation/velocity updates
3. Client lerps/slerps to new position smoothly
4. **No reconciliation** - just interpolation

### Implementation
- `CC.POSITION_UPDATE` handler in `setupSocket()`
- Simple lerp/slerp to new position
- No input buffering or state buffering needed
- No rewinding or re-applying inputs

## Message Flow

```
Local Player:
Client → Server: CS.INPUT_BUFFER (inputs)
Server → Client: CC.STATE_BUFFER (authoritative state)
Client: Reconciles if position differs

Other Players:
Server → Client: CC.POSITION_UPDATE (position update)
Client: Lerps to new position (no reconciliation)
```

## Why This Design?

1. **Local Player**: Needs reconciliation because:
   - Client predicts movement for responsiveness
   - Server is authoritative, so client must correct when wrong
   - Input buffering allows re-applying inputs after correction

2. **Other Players**: Don't need reconciliation because:
   - Client doesn't predict their movement
   - Server sends authoritative updates
   - Simple interpolation is sufficient
   - No input buffering needed (we don't have their inputs)

## Code Locations

- **Local Player Reconciliation**: `frontend/src/game/controller/PredictionController.ts`
- **Other Players Interpolation**: `frontend/src/game/api/setup/world.ts` (CC.POSITION_UPDATE handler)
- **Game Loop Integration**: `frontend/src/game/game.ts` (predictionController.update())

## Testing

To verify reconciliation is working:
1. Add console.log in `handleServerReconciliation()` - should see "Reconciliation needed" when position differs
2. Test with network lag - local player should correct smoothly
3. Other players should move smoothly without jitter


