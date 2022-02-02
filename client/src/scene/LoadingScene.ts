
export default class LoadingScene extends Phaser.Scene {

  private name: string

  prefixedKey(...vals: string[]) {
    return `tilemap_${this.name}_` + vals.join("_");
  }

  init({ name }) {
    console.log('init loading')
    this.name = name
  }

  preload() {
    console.log('preload loading')
    this.load.baseURL = "/maps/";

    const tileMapData = this.cache.tilemap.get(this.prefixedKey("map"))

    if (!tileMapData) {
      this.load.tilemapTiledJSON(this.prefixedKey("map"), `${this.name}.json`);
    }

    this.load.spritesheet("player_gfx", "images/TX Player.png", {
      frameWidth: 32,
      frameHeight: 64,
      endFrame: 3,
    });

    const progressBarOuter = this.add.graphics();
    const progressBarInner = this.add.graphics();
    const progressBar = new Phaser.Geom.Rectangle(200, 200, 400, 50);
    const progressBarFill = new Phaser.Geom.Rectangle(205, 205, 290, 40);

    progressBarOuter.fillStyle(0xffffff, 1);
    progressBarOuter.fillRectShape(progressBar);

    progressBarInner.fillStyle(0x3587e2, 1);
    progressBarInner.fillRectShape(progressBarFill);

    const loadingText = this.add.text(250, 260, "Loading: ", { fontSize: '32px', color: '#FFF' });

    this.load.once('progress', (progress) => {
      progressBarInner.clear();
      progressBarInner.fillStyle(0x3587e2, 1);
      progressBarInner.fillRectShape(new Phaser.Geom.Rectangle(205, 205, progress * 390, 40));

      progress = progress * 100;
      loadingText.setText("Loading: " + progress.toFixed(2) + "%");
      console.log("P:" + progress);
    });
  }

  create(opts) {

    console.log('create loading')

    let itemsToBeLoaded = 0
    const tileMapData = this.cache.tilemap.get(this.prefixedKey("map")).data

    tileMapData.tilesets.forEach((ts) => {
      const tex = this.textures.get(this.prefixedKey(ts.name))
      if (tex.key !== '__MISSING') {
        return
      }

      this.load.image(this.prefixedKey(ts.name), ts.image);
      itemsToBeLoaded++
      return
    });

    console.log('loading %d items', itemsToBeLoaded)

    if (itemsToBeLoaded) {
      this.load.once('complete', () => {
        this.scene.stop('loading')
        this.scene.start('ui')
        this.scene.start('game', opts)
        this.scene.bringToTop('ui')
      })

      this.load.start()
      return
    }

    this.scene.stop('loading')
    this.scene.start('ui')
    this.scene.start('game', opts)
    this.scene.bringToTop('ui')
  }
}
