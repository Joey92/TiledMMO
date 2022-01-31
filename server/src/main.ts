import { sWorld } from './game/entities/World';

let lastTick = new Date();

const world = sWorld;

const worldTick = setInterval(() => {
	const currentTick = new Date();
	const diff = currentTick.getTime() - lastTick.getTime();
	world.update(diff);
	lastTick = currentTick;
}, 30);

const shutdownServer = () => {
	clearInterval(worldTick);
	world.shutdown();
};

process.on('SIGTERM', () => {
	shutdownServer();
})

