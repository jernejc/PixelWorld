import logger from "@util/logger";
import Button from "./form/button";
import Input from "./form/input";

export default class TokenInfo {

  constructor({ parent }) {
    logger.log('TokenInfo: constructor');

    this.parent = parent;

    this.setupDom();
  }

  setupDom() {
    logger.log('TokenInfo: setupDom');

    const _self = this;

    this.domElement = document.createElement('div');
    this.domElement.classList.add('colab-info');
    this.domElement.innerHTML = '$COLAB token is used to draw on the canvas, you can get it <b>FREE mint</b>, by connecting your Twitter account and come say hi on our Discord channel.';

    this.twitterButton = new Button({
      icon: 'twitter-logo.png',
      text: 'Connect',
      elClasses: ['action-button', 'social-connect', 'twitter']
    })

    this.domElement.append(this.twitterButton.domElement)
    
    this.discordButton = new Button({
      icon: 'discord-icon.png',
      text: 'Say "hi"',
      elClasses: ['action-button', 'social-connect', 'discord']
    });

    this.domElement.append(this.discordButton.domElement);

    this.supportForm = {
      value: 0.2
    }

    this.supportHeader = document.createElement('h3');
    this.supportHeader.textContent = 'or Support the project: ';

    this.domElement.append(this.supportHeader);

    this.supportInput = new Input(this.supportForm, 'value', {
      elClasses: ['input'],
      type: 'number',
      step: 0.2,
      min: 0.2,
      max: 9999,
      label: 'ETH',
      dynamicWidth: true,
      decimals: 1,
      onChange: async () => {
        _self.refreshTokenCalc()
      }
    });

    this.domElement.append(this.supportInput.domElement);

    this.tokenCalc = document.createElement('div');
    this.tokenCalc.classList.add('colab-calc');
    this.domElement.append(this.tokenCalc);

    this.creditButton = new Button({
      icon: 'gg-arrows-exchange-alt',
      text: 'Exchange',
      elClasses: ['action-button', 'credit-token'],
    });

    this.domElement.append(this.creditButton.domElement);

    this.parent.append(this.domElement);
    
    this.refreshTokenCalc();
  }

  refreshTokenCalc() {
    //console.log('refreshTokenCalc', this.supportInput.input.value, this.supportForm.value)
    this.tokenCalc.innerHTML = `<i class="gg-arrows-exchange-alt"></i> ${parseInt(this.supportInput.input.value * 500)} $COLAB`;
  }

  destroy() {
    logger.log('TokenInfo: destroy');

    this.parent.removeChild(this.domElement);
  }

}