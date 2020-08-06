
import Color from './color';

/**
 * ColorPicker Class
 */

export default class ColorInput extends Color {

  constructor(object, property, params) {

		super(object, property, params);

    const self = this;

    let prevY;

		this.input = document.createElement('input');

		if (params.type)
			this.input.setAttribute('type', params.type);
		else
			this.input.setAttribute('type', 'text');

		this.border = document.createElement('div');
		this.border.classList.add('input-border');

		this.domElement.appendChild(this.input);
		this.domElement.appendChild(this.border);
		this.domElement.classList.add('color-input');
		
    this.input.addEventListener('change', onChange);
    this.input.addEventListener('blur', onBlur);
    this.input.addEventListener('mousedown', onMouseDown);
    this.input.addEventListener('keydown', e => {
      // When pressing enter, you can be as precise as you want.
      if (e.keyCode === 13) {
        self.blur();
        onFinish();
      }
    });

		this.updateDisplay();

		return this.domElement;

		// Helpers
		
		function onChange() {
			const attempted = parseFloat(self.input.value);
			
      if (!isNaN(attempted)) 
        self.setValue(attempted);
    }

    function onFinish() {
      if (self.onFinishChange) 
        self.onFinishChange.call(self, self.getValue());
    }

    function onBlur() {
      onFinish();
    }

    function onMouseDrag(e) {
      const diff = prevY - e.clientY;
      self.setValue(self.getValue() + diff * self.step);

      prevY = e.clientY;
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseDrag);
      window.removeEventListener('mouseup', onMouseUp);
      onFinish();
    }

    function onMouseDown(e) {
      window.addEventListener('mousemove', onMouseDrag);
      window.addEventListener('mouseup', onMouseUp);
      prevY = e.clientY;
    }
	}

	updateDisplay() {
    this.input.value = this.getValue();
    return super.updateDisplay();
  }
}