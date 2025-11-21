# Client Integration Guide

## Current Status

✅ **COMPLETED**: The client-side `PredictionController` is now fully integrated into the game loop. The system works as follows:

-   **Local Player**: Uses `PredictionController` for client prediction and server reconciliation
-   **Other Players**: Receive `CC.POSITION_UPDATE` and are lerped (no reconciliation)
-   **Game Rendering**: Starts immediately during countdown (doesn't wait for `CC.START_GAME`)
-   **Countdown**: Shows "3", "2", "1", "Go!" during the 5 second wait

## What Needs to Be Done

### 1. Replace Old Input System

Currently, the client uses `KeyboardController` which sends `CS.KEY_DOWN` and `CS.KEY_UP` messages. This needs to be replaced with `PredictionController` that sends `CS.INPUT_BUFFER` messages.

### 2. Integration Points

#### In `frontend/src/game/api/setup/world.ts`

Replace or modify the `setupSocket` function to:

1. Create a `PredictionController` instance
2. Connect it to send `CS.INPUT_BUFFER` messages
3. Handle `CC.STATE_BUFFER` messages to update prediction
4. Handle `CC.POSITION_UPDATE` messages for other players
5. Update the game loop to call `predictionController.update()`

#### Example Integration:

```typescript
import { PredictionController } from "@/game/controller/PredictionController";
import { CS, CC } from "@/shared/types/codes";
import { InputPayload, StatePayload } from "@shared/types/payloads";

function setupSocket(
    client: KartClient,
    localID: number,
    players: Map<number, [string, number, boolean]>
) {
    Global.client = client;

    // Create prediction controller for local player
    const predictionController = new PredictionController(
        (inputPayload: InputPayload) => {
            client.send(CS.INPUT_BUFFER, inputPayload);
        }
    );

    // Handle server state updates
    client.onMessage(CC.STATE_BUFFER, (state: StatePayload) => {
        predictionController.onServerMovementState(state);
    });

    // Handle other players' position updates
    client.onMessage(
        CC.POSITION_UPDATE,
        (data: {
            pid: number;
            position: Vector3Like;
            quaternion: QuaternionLike;
            velocity: Vector3Like;
            turboMode: boolean;
            rocketMode: boolean;
            driftSide: number;
            mushroomAddon: number;
        }) => {
            const onlinePlayer = Player.clients.get(data.pid);
            if (onlinePlayer) {
                // Update online player position/rotation
                onlinePlayer.position.set(
                    data.position.x,
                    data.position.y,
                    data.position.z
                );
                onlinePlayer.quaternion.set(
                    data.quaternion.x,
                    data.quaternion.y,
                    data.quaternion.z,
                    data.quaternion.w
                );
                onlinePlayer.velocity.set(
                    data.velocity.x,
                    data.velocity.y,
                    data.velocity.z
                );

                // Update visual effects
                onlinePlayer.turboMode = data.turboMode;
                onlinePlayer.rocketMode = data.rocketMode;
                onlinePlayer.driftSide = data.driftSide;
                onlinePlayer.mushroomAddon = data.mushroomAddon;
            }
        }
    );

    // Update prediction controller in game loop
    // This should be called in the main game update loop (probably in game.ts)
    // predictionController.update(deltaTime);
}
```

### 3. Update Game Loop

In the main game update loop (likely in `frontend/src/game/game.ts` or similar), add:

```typescript
// In the game loop
const predictionState = predictionController.update(deltaTime);

// Apply predicted state to local player
if (localPlayer) {
    localPlayer.position.lerp(predictionState.position, 0.1);
    localPlayer.quaternion.slerp(predictionState.quaternion, 0.1);
    localPlayer.velocity.lerp(predictionState.velocity, 0.1);
}
```

### 4. Remove Old Input System

Once `PredictionController` is integrated:

1. Remove or disable `KeyboardController` sending `CS.KEY_DOWN`/`CS.KEY_UP`
2. Remove `CS.UPDATE_TRANSFORM` message handling (server now controls this)
3. Update `DriveController` on client to be visual-only (server does physics)

### 5. Handle Game Start

Make sure `PredictionController` starts sending inputs only after `CC.START_GAME` is received:

```typescript
let gameStarted = false;

client.onMessage(CC.START_GAME, () => {
    gameStarted = true;
    // Start prediction controller
});

// In prediction controller update:
if (!gameStarted) {
    // Don't send inputs yet
    return;
}
```

## Testing Checklist

-   [ ] Client sends `CS.INPUT_BUFFER` messages
-   [ ] Client receives `CC.STATE_BUFFER` messages
-   [ ] Client receives `CC.POSITION_UPDATE` for other players
-   [ ] Local player movement is predicted smoothly
-   [ ] Reconciliation works when server state differs
-   [ ] Other players' positions update correctly
-   [ ] No jitter or stuttering in movement
-   [ ] Works with network lag

## Notes

-   The server is ready and waiting for `CS.INPUT_BUFFER` messages
-   The `PredictionController` class is fully implemented
-   Integration is mainly about connecting it to the existing game loop
-   Old input system can be kept temporarily for backwards compatibility during testing
