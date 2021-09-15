
/**
 * Listen to Pixel and PixelBid contract events and response if needed
 * Supported events:
 *   - ColorPixels - generate a png image of world based on event pixels/colors
 */

const Web3 = require('web3');
const Jimp = require('jimp');

// Generated by migrations
const PixelsContract = require('../build/contracts/Pixels.json');
const dappConfig = require('../dapp-config.json');

// Local helpers
const { colorPixel } = require('./helpers');

// Init web3 and contract(s)
const web3Instance = new Web3(dappConfig.wsUrl);
const pixelsContract = new web3Instance.eth.Contract(
  PixelsContract.abi,
  dappConfig.PixelsAddress
);

// Wrap with an async function so await works (makes things cleaner)
(async () => {
  console.log('Init Event Listeners!');

  const imagePath = '../assets/images/world.png';
  let worldImage;

  try {
    worldImage = await Jimp.read(imagePath);
  } catch (error) {
    console.error('Failed to load worldImage', error);
  }

  /**
   * Subscribe to ColorPixels
   * Pixels Contract
   */
  
  pixelsContract.events.ColorPixels({ fromBlock: web3Instance.eth.blockNumber })
    .on('data', e => {
      console.log('ColorPixels event triggered');

      try {
        const positions = e.returnValues._positions;
        const colors = e.returnValues._colors;

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
            worldImage.write(imagePath);
            console.log('World image pixels updated!');
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
    });

})();