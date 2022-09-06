
const Web3 = require('web3');

// Local helpers
const { colorPixel, updateWorldImage, loadWorldImage } = require('./helpers');
// Infura client
const ipfs = require('./ipfs');
// Generated by migrations
const CollabCanvasABI = require('./abis/CollabCanvas.json');
// Config
const config = require('./config');
// Socker provider config
const options = {
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: true
  }
};

const web3Instance = new Web3(new Web3.providers.WebsocketProvider(config.wsUrl, options));
const canvasContract = new web3Instance.eth.Contract(
  CollabCanvasABI,
  config.canvasAddress
);

let emitter = null;

/**
 * 
 * CollabCanvas Contract
 * 
 * Subscribe to ColorPixels
 * Needs better event handling
 * 
 */

module.exports = {
  canvasContractListeners
}

async function canvasContractListeners() {
  clearEmitter();

  emitter = canvasContract.events.ColorPixels({ fromBlock: 'earliest' })
    .on('data', async e => {
      console.log('ColorPixels event triggered.', JSON.stringify(e));
      const worldImage = await loadWorldImage();

      if (!worldImage)
        throw new Error('Failed to load world image');
        
      try {
        const positions = e.returnValues.positions;
        const colors = e.returnValues.colors;

        let updateWorld = false;

        if (positions.length > 0) {
          positions.forEach((position, pindex) => {
            const color = colors[pindex];

            if (position && color) {
              colorPixel(position, color, worldImage);
              updateWorld = true;
            }
          });

          if (updateWorld) {
            await updateWorldImage(worldImage, ipfs)
          }
        }
      } catch (error) {
        console.error('Failed to update World Image pixels', error);
      }
    })
    .on('changed', e => {
      console.log('ColorPixels changed', e);
    })
    .on('error', error => {
      console.error('ColorPixels event error', error);

      clearEmitter();
      throw new Error('Force restart');
    });
}

function clearEmitter() {
  if (emitter !== null) {
    emitter.removeAllListeners('data');
    emitter.removeAllListeners('changed');
    emitter.removeAllListeners('error');
    emitter = null;
  }
}