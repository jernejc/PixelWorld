import {
  numberToLetterColumn,
  formatColorNumber,
  stringToBN,
  stringToHex,
  hexToString,
  formatPositionHex,
} from "@util/helpers";
import logger from '@util/logger';

import { setInvertedStroke, resetStrokeStyle } from "@actions/general";

export default class Pixel {
  constructor({ tile, scene, color, cx, cy }) {
    logger.log("Pixel: constructor", cx, cy);

    this.tile = tile;
    this.scene = scene;
    this.cx = cx;
    this.cy = cy;

    if (color) {
      this.color = Phaser.Display.Color.HexStringToColor(
        "#" + formatColorNumber(color)
      );

      this.originalColor = this.color.clone();
    }
  }

  get position() {
    return numberToLetterColumn(this.cy) + this.cx;
  }

  get HEXcolor() {
    if (this.color) return formatColorNumber(this.color.color);
    else return "FFFFFF";
  }

  get y() {
    return this.tile ? this.tile.y : null;
  }

  get x() {
    return this.tile ? this.tile.x : null;
  }

  get hasChanges() {
    return (this.originalColor && (this.originalColor.color !== this.color.color));
  }

  changeToColorHex(hex) {
    logger.log("Pixel: changeToColorHex", hex)

    if (!this.originalColor) this.originalColor = this.color;

    this.color = Phaser.Display.Color.HexStringToColor("#" + hexToString(hex));

    if (this.tile) this.tile.setFillStyle(this.color.color);

    //this.setActivePixel();
  }

  changeToColorNumber(color) {
    logger.log("Pixel: changeToColorNumber");

    if (!this.originalColor) this.originalColor = this.color.clone();

    this.color.setFromRGB(color);

    if (this.tile) this.tile.setFillStyle(this.color.color);

    //this.setActivePixel();
  }

  async setColor() {
    logger.log("setColor", this.cx, this.cy, this.HEXcolor);

    try {
      await this.scene.game.web3.pixelContract.methods
        .setColor(
          stringToBN(this.position), // pixel position
          stringToHex(this.HEXcolor) // pixel color
        )
        .send({
          from: this.scene.game.web3.activeAddress,
          gas: 200000,
        });
    } catch (error) {
      logger.error("Pixel: setColor", error);
    }

    this.setWorldCanvasPixel();
  }

  setWorldCanvasPixel() {
    this.scene.worldmap.setPixel(
      this.cx,
      this.cy,
      this.color.r,
      this.color.g,
      this.color.b
    );

    this.scene.worldmap.update();
  }

  async loadGraphData(refresh) {
    this.loadingGraph = true;

    const data = await this.scene.game.graph.loadPixel(
      {
        id: this.position,
      },
      refresh
    );

    if (data) this.setGraphData(data);
    else {
      this.loadingGraph = false;
      this.graphLoaded = true;
    }

    this.scene.game.emitter.emit("graph/update", this);
  }

  setGraphData(data) {
    logger.log('Pixel: setGraphData');

    if (data) {
      if (!this.bid)
        this.bid = this.scene.game.web3.defaultPrice;
      if (data.color)
        this.changeToColorHex(data.color);
      if (data.modifiedAt)
        this.modifiedAt = data.modifiedAt;

      this.owner = data.owner.toLowerCase();
    }

    this.loadingGraph = false;
    this.graphLoaded = true;
  }

  setActivePixel() {
    logger.log('Pixel: setActivePixel');

    if (this.tile) setInvertedStroke({ tile: this.tile, scene: this.scene });
  }

  clearActivePixel() {
    logger.log('Pixel: clearActivePixel');

    if (this.tile) resetStrokeStyle({ tile: this.tile, scene: this.scene });

    this.scene.game.selection.clearRectangleSelection();
  }

  removeFromSelection() {
    logger.log('Pixel: removeFromSelection');

    this.clearActivePixel();
    this.resetColor();
  }

  static fromTile({ tile, scene }) {
    const color = tile.fillColor;
    const pixel = new Pixel({ tile, scene, color, cx: tile.cx, cy: tile.cy });

    if (!pixel.bid) pixel.bid = scene.game.web3.defaultPrice;

    return pixel;
  }

  static fromGraphData({ scene, data }) {
    const position = formatPositionHex(data.id);
    const pixel = new Pixel({
      tile: null,
      scene,
      cx: position.cx,
      cy: position.cy,
    });

    pixel.setGraphData(data)

    return pixel;
  }

  resetColor() {
    if (this.originalColor && this.originalColor.color !== this.color.color) {
      this.changeToColorNumber(this.originalColor);
      this.originalColor = null;
    }
  }
}
