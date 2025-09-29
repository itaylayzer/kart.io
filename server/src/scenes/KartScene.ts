import { ArraySchema } from "@colyseus/schema";
import { Body, Box, Material, Vec3, World } from "cannon-es";
import {
    BufferGeometry,
    CatmullRomCurve3,
    Float32BufferAttribute,
    Mesh,
    MeshBasicMaterial,
    Raycaster,
    Scene,
    Vector3,
} from "three";
import { MysteryBoxSchema } from "@/rooms/schema/KartRaceState";
import { PlayerEntity } from "@/entities/PlayerEntity";
import { curvePoints } from "@shared/config/road";
import { InputPayload } from "@shared/types/payloads";

type PlayerMap = Map<string, PlayerEntity>;

export class KartScene {
    public readonly scene: Scene;
    public readonly world: World;

    private roadMeshes: Mesh[] = [];
    private mysteryBodies: Body[] = [];
    private players: PlayerMap = new Map();

    constructor(
        private mapId: number,
        mysteries: ArraySchema<MysteryBoxSchema>,
        private onMysteryTouched: (pid: number, mysteryIndex: number) => void,
        private onPlayerStateStepped: (pid: number) => void,
    ) {
        this.scene = new Scene();
        this.world = new World();
        this.world.gravity.set(0, 0, 0);
        this.world.allowSleep = true;

        this.buildRoadGeometry();
        this.buildMysteryTriggers(mysteries);

        this.world.addEventListener("beginContact", (event: any) => {
            const a = event.bodyA as Body;
            const b = event.bodyB as Body;
            const mystery = (a as any).isMystery ? a : (b as any).isMystery ? b : null;
            const player = (a as any).isPlayer ? a : (b as any).isPlayer ? b : null;
            if (!mystery || !player) return;

            const mysteryIndex: number = (mystery as any).mysteryIndex;
            const pid: number = (player as any).pid;
            this.onMysteryTouched?.(pid, mysteryIndex);
        });
    }

    addPlayer(
        sessionId: string,
        pid: number,
        startPos: Vector3,
        startQuat: { x: number; y: number; z: number; w: number },
    ) {
        const entity = new PlayerEntity(this.world, this.roadMeshes);
        entity.spawn(pid, startPos, {
            x: startQuat.x,
            y: startQuat.y,
            z: startQuat.z,
            w: startQuat.w,
        });
        this.players.set(sessionId, entity);
    }

    removePlayer(sessionId: string) {
        const entity = this.players.get(sessionId);
        if (!entity) return;

        entity.dispose();
        this.players.delete(sessionId);
    }

    onInput(sessionId: string, payload: InputPayload) {
        this.players.get(sessionId)?.onInput(payload);
    }

    step(dt: number) {
        this.world.step(dt);

        for (const [, entity] of this.players) {
            entity.afterPhysicsStep();
            this.onPlayerStateStepped?.(entity.pid);
        }
    }

    dispose() {
        this.roadMeshes.length = 0;
        this.mysteryBodies.length = 0;
        this.scene.clear();
    }

    private buildRoadGeometry() {
        this.roadMeshes = createServerRoadMeshes(this.mapId);
        for (const mesh of this.roadMeshes) {
            this.scene.add(mesh);
            mesh.updateMatrixWorld(true);
        }
    }

    private buildMysteryTriggers(mysteries: ArraySchema<MysteryBoxSchema>) {
        for (let i = 0; i < mysteries.length; i++) {
            const mystery = mysteries[i];
            const body = new Body({
                mass: 0,
                material: new Material({ friction: 0, restitution: 0 }),
                position: new Vec3(mystery.position.x, mystery.position.y, mystery.position.z),
                collisionFilterGroup: 3,
                collisionFilterMask: 1,
            });
            body.addShape(new Box(new Vec3(0.25, 0.25, 0.25)));
            (body as any).isMystery = true;
            (body as any).mysteryIndex = mystery.index;
            body.type = Body.KINEMATIC;
            this.world.addBody(body);
            this.mysteryBodies.push(body);
        }
    }

    getPlayer(sessionId: string) {
        return this.players.get(sessionId);
    }

    forEachPlayer(callback: (sessionId: string, entity: PlayerEntity) => void) {
        for (const [id, entity] of this.players) {
            callback(id, entity);
        }
    }
}

function createServerRoadMeshes(mapId: number): Mesh[] {
    const points = curvePoints[mapId] ?? curvePoints[0];
    const vectors: Vector3[] = [];
    for (let i = 0; i < points.length; i += 3) {
        vectors.push(new Vector3(points[i], points[i + 1], points[i + 2]));
    }

    const curve = new CatmullRomCurve3(vectors);
    const segments = 1000;
    const width = 7;

    const positions: number[] = [];
    const indices: number[] = [];

    const forward = new Vector3();
    const up = new Vector3(0, 1, 0);
    const left = new Vector3();
    const right = new Vector3();

    const curvePointsArray = curve.getPoints(segments);
    for (let i = 0; i < segments; i++) {
        const p0 = curvePointsArray[i];
        const p1 = curvePointsArray[i + 1] ?? curvePointsArray[i];

        forward.copy(p1).sub(p0).normalize();
        left.copy(up).cross(forward).normalize().multiplyScalar(width * 0.5);
        right.copy(left).multiplyScalar(-1);

        const a = new Vector3().copy(p0).add(left);
        const b = new Vector3().copy(p0).add(right);
        const c = new Vector3().copy(p1).add(right);
        const d = new Vector3().copy(p1).add(left);

        const base = positions.length / 3;
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z);
        indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new Mesh(geometry, new MeshBasicMaterial());
    return [mesh];
}
