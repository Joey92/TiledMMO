export default class MenuScene extends Phaser.Scene {
	preload() {
	}
	create({ error }) {
		this.add.text(0, 0, 'Main menu dummy', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });

		if (error) {
			this.add.text(0, 200, `Error: ${error}`, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
		}
	}
}
