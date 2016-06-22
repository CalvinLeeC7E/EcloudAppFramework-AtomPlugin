'use babel';
import { TextBuffer } from 'atom';
export default class EcloudGenerateView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('ecloud-generate');

    // Create message element
    const message = document.createElement('atom-text-editor');
    message.setAttribute('mini', '');
    message.setAttribute('buffer', new TextBuffer());
    message.setAttribute('placeholder-text', 'ControllerName');
    this.mess = this.element.appendChild(message);
  }
  setKeyDown(func){
    this.mess.onkeydown = func;
  }

  getMess(){
    return this.mess;
  }
  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
