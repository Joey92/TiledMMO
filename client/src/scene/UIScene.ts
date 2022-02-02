import GameObject from "../actors/GameObject";

export interface Gossip {
	talker: GameObject,
	text: string
}

export default class UIScene extends Phaser.Scene {

	private gossipText: Gossip[] = []
	private textbox: Phaser.GameObjects.Graphics
	private textboxText: Phaser.GameObjects.Text
	private textboxTextHeader: Phaser.GameObjects.Text

	init() {
		this.textbox = this.add.graphics()
		const size = new Phaser.Geom.Rectangle(100, 100, 300, 100)

		this.textbox.fillStyle(0xffffff, 1);
		this.textbox.fillRectShape(size);

		this.textboxText = this.add.text(100, 100, "This is a text box", { fontSize: '32px', color: '#000', wordWrap: { width: 300 } });
		this.textboxTextHeader = this.add.text(100, 75, "This is the speaker name", { fontSize: '32px', color: '#000', maxLines: 1 });

		this.hideTextBox()
	}

	preload() {
	}

	advanceGossip() {
		const currentText = this.gossipText.shift()

		if (!currentText) {
			console.log('Hide text box')
			// nothing more to do, close text box
			this.hideTextBox()
			return
		}

		this.textboxText.text = currentText.text
		this.textboxTextHeader.text = currentText.talker.name
	}

	hideTextBox() {
		this.textboxTextHeader.text = ""
		this.textboxText.text = ""

		this.textbox.setVisible(false)
		this.textboxText.setVisible(false)
		this.textboxTextHeader.setVisible(false)

		this.input.off('pointerup');
	}

	showTextBox() {
		this.textbox.setVisible(true)
		this.textboxText.setVisible(true)
		this.textboxTextHeader.setVisible(true)

		this.input.on('pointerup', this.advanceGossip, this);
	}

	addGossipText(txt: Gossip) {

		if (this.gossipText.length == 0) {
			// if this is the first text: open the text box
			this.gossipText.push(txt)
			this.showTextBox()
			return this
		}
		// text box is probably open already, just add it to the queue
		this.gossipText.push(txt)
		return this
	}
}
