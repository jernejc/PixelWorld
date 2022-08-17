import config from '@util/config';
import logger from '@util/logger';

export default class Slideshow {
  constructor({ parent, buttonAction }) {
    logger.log('Slideshow: constructor');

    if (parent)
      this.parent = parent;
    if (buttonAction)
      this.buttonAction = buttonAction;

    this.domElement = document.createElement('div');
    this.domElement.setAttribute('id', 'slideshow');

    this.articles = config.slideshow.articles;

    this.bindNavAction = this.navAction.bind(this);
    this.bindNextPrevAction = this.nextPrevAction.bind(this);
    this.bindDiscordAction = this.discordAction.bind(this);
    this.bindToggleActionBar = this.toggleActionBar.bind(this);
    this.bindFormAction = this.formAction.bind(this);
    this.bindActionTextInputChangeAction = this.actionTextInputChangeAction.bind(this);

    this.setupDom();
  }

  setupDom() {
    logger.log('Slideshow: setupDom');

    this.index = 0;
    this.slideIndex = 0;
    this.slides = [];
    this.navItems = [];

    // Slide article 
    this.slidesWrapper = document.createElement('div');
    this.slidesWrapper.classList.add('slides-wrapper');

    // Navigation
    this.navWrapper = document.createElement('div');
    this.navWrapper.classList.add('slides-nav');

    this.navItemsWrapper = document.createElement('div');
    this.navItemsWrapper.classList.add('slides-nav-items');

    this.navItemsWrapper.addEventListener('click', this.bindNavAction);

    // Navigation buttons
    this.leftIcon = document.createElement('i')
    this.leftIcon.classList.add('gg-play-button', 'left', 'disabled');

    this.rightIcon = document.createElement('i')
    this.rightIcon.classList.add('gg-play-button', 'right');

    this.leftIcon.addEventListener('click', this.bindNextPrevAction);
    this.rightIcon.addEventListener('click', this.bindNextPrevAction);

    // Action bar
    this.actionBarForm = document.createElement('form');
    this.actionBarForm.classList.add('action-bar');

    this.actionBarForm.addEventListener('submit', this.bindFormAction);

    this.actionTextInputWrapper = document.createElement('div');
    this.actionTextInputWrapper.classList.add('action-text-wrapper');

    this.actionTextInput = document.createElement('input');
    this.actionTextInput.type = 'text';
    this.actionTextInput.classList.add('text-input');

    this.actionTextInput.addEventListener('keydown', this.bindActionTextInputChangeAction);
    this.actionTextInputWrapper.append(this.actionTextInput);

    this.inputIcon = document.createElement('i');
    this.inputIcon.classList.add('text-input-icon');
    this.actionTextInputWrapper.append(this.inputIcon);

    this.slideActionButton = document.createElement('button');
    this.slideActionButton.type = 'submit';
    this.slideActionButton.classList.add('slide-action');

    this.keyNoteWrapper = document.createElement('span');
    this.keyNoteWrapper.classList.add('key-note');

    this.keyNoteWrapper.addEventListener('click', this.bindToggleActionBar);
    this.keyNoteWrapper.setAttribute('flow', 'down');
    this.keyNoteWrapper.setAttribute('color', 'green');

    this.discordButton = document.createElement('button')
    this.discordButton.classList.add('discord-action');
    this.discordButton.innerHTML = '<img src="assets/images/icons/discord-icon.png" />';

    this.discordButton.addEventListener('click', this.bindDiscordAction);

    this.actionBarForm.append(this.actionTextInputWrapper);
    this.actionBarForm.append(this.slideActionButton);
    this.actionBarForm.append(this.discordButton);
    this.actionBarForm.append(this.keyNoteWrapper);

    this.setActionBarAction('email');

    // Load articles
    this.articles.forEach((article, i) => {
      let active = false;

      if (i === 0)
        active = true;

      const navItem = this.navTemplate({ ...article, active });
      this.navItems.push(navItem)
      this.navItemsWrapper.append(navItem);

      const slide = this.slideTemplate({ ...article, active });
      this.slides.push(slide);
      this.slidesWrapper.append(slide);

      if (active) {
        this.currentSlide = slide;
        this.currentNav = navItem;
      }
    });

    // Assemble DOM
    this.navWrapper.append(this.navItemsWrapper);
    this.navWrapper.prepend(this.leftIcon);
    this.navWrapper.append(this.rightIcon);

    this.slidesWrapper.append(this.navWrapper);
    this.slidesWrapper.append(this.actionBarForm);
    
    this.domElement.append(this.slidesWrapper);

    this.insipredBy = document.createElement('div');
    this.insipredBy.id = 'inspired-by';

    this.insipredBy.innerHTML = `
      Inspired by <a href="https://en.wikipedia.org/wiki/Poietic_Generator" target="_blank">Poietic Generator</a> 
      and 
      <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="_blank">Game of Life</a>
    `

    this.domElement.append(this.insipredBy);

    this.parent.append(this.domElement);
  }

  navTemplate({ shortTitle, icon, active }) {
    logger.log('Slideshow: navTemplate');

    const navItem = document.createElement('div');
    navItem.classList.add('nav-item');

    const navTitle = document.createElement('span');

    if (active)
      navItem.classList.add('nav-active');

    const navItemTitle = document.createElement('div');
    navItemTitle.classList.add('nav-title');

    navItemTitle.innerText = shortTitle;

    navItem.append(navItemTitle);
    navItem.append(navTitle);

    return navItem;
  }

  slideTemplate({ title, body, icon, active }) {
    logger.log('Slideshow: slideTemplate');

    const slide = document.createElement('article');
    slide.classList.add('post');

    if (active)
      slide.classList.add('slide-active');
    else
      slide.classList.add('slide-not-active');

    const heading = document.createElement('h2');
    heading.classList.add('slide-title');

    heading.textContent = title;

    if (icon) {
      const headingIcon = document.createElement('img');
      headingIcon.src = `assets/images/icons/${icon}`;

      heading.prepend(headingIcon);
    }

    const content = document.createElement('p');
    content.classList.add('slide-content');

    content.innerHTML = body;

    slide.append(heading);
    slide.append(content);

    return slide;
  }

  setActionBarAction(action) {
    logger.log('Slideshow: setActionBarAction', action);

    this.actionBarAction = action;
    this.actionTextInput.value = '';

    switch (this.actionBarAction) {
      case 'email':
        this.slideActionButton.innerHTML = config.slideshow.emailActionText;
        this.actionTextInput.placeholder = 'join the waitlist';

        this.inputIcon.classList.remove('gg-key');
        this.inputIcon.classList.add('gg-mail');
        break;
      case 'key':
        this.slideActionButton.innerHTML = config.slideshow.keyActionText;
        this.actionTextInput.placeholder = 'enter access key';

        this.inputIcon.classList.remove('gg-mail');
        this.inputIcon.classList.add('gg-key');
        break;
    }

    this.resetInputState();
  }

  toggleActionBar() {
    logger.log('Slideshow: toggleActionBar');

    if (
      this.keyNoteWrapper.classList.contains('error') ||
      this.keyNoteWrapper.classList.contains('success')
    ) {
      this.actionTextInput.value = '';
      this.resetInputState();
      return;
    }

    if (this.actionBarAction === 'email')
      this.setActionBarAction('key');
    else
      this.setActionBarAction('email');
  }

  setInputErrorState() {
    logger.log('Slideshow: setInputErrorState');

    this.actionTextInputWrapper.classList.add('error');
    this.keyNoteWrapper.classList.add('error');

    switch (this.actionBarAction) {
      case 'email':
        this.keyNoteWrapper.innerHTML = 'invalid e-mail <span> - clear</span>';
        this.slideActionButton.innerHTML = config.slideshow.emailActionText;
        break;
      case 'key':
        this.keyNoteWrapper.innerHTML = 'invalid access key <span> - clear</span>';
        this.slideActionButton.innerHTML = config.slideshow.keyActionText;
        break;
    }

    this.keyNoteWrapper.setAttribute('tooltip', '');
  }

  setInputSuccessState() {
    logger.log('Slideshow: setInputSuccessState');

    this.actionTextInputWrapper.classList.add('success');
    this.keyNoteWrapper.classList.add('success');
    this.slideActionButton.classList.add('success');

    switch (this.actionBarAction) {
      case 'key':
      case 'email':
        this.keyNoteWrapper.innerHTML = 'we\'ll be in touch <span> - clear</span>';
        this.slideActionButton.innerHTML = '<i class="gg-check"></i>';
        break;
    }

    this.keyNoteWrapper.setAttribute('tooltip', '');
  }

  resetInputState() {
    logger.log('Slideshow: resetInputState');

    if (this.actionTextInputWrapper.classList.contains('success'))
      this.actionTextInputWrapper.classList.remove('success');
    if (this.actionTextInputWrapper.classList.contains('error'))
      this.actionTextInputWrapper.classList.remove('error');
    if (this.keyNoteWrapper.classList.contains('success'))
      this.keyNoteWrapper.classList.remove('success');
    if (this.keyNoteWrapper.classList.contains('error'))
      this.keyNoteWrapper.classList.remove('error');
    if (this.slideActionButton.classList.contains('success'))
      this.slideActionButton.classList.remove('success');

    switch (this.actionBarAction) {
      case 'email':
        this.keyNoteWrapper.setAttribute('tooltip', 'While in private beta, access key is required.');
        this.keyNoteWrapper.innerHTML = 'use a key <i class="gg-key"></i>';
        this.slideActionButton.innerHTML = config.slideshow.emailActionText;
        break;
      case 'key':
        this.keyNoteWrapper.setAttribute('tooltip', 'Access key will be sent to your e-mail.');
        this.keyNoteWrapper.innerHTML = 'join the waitlist <i class="gg-mail"></i>';
        this.slideActionButton.innerHTML = config.slideshow.keyActionText;
        break;
    }
  }

  formValid() {
    logger.log('Slideshow: formValid');

    if (this.actionTextInput.value === '')
      return false;

    if (
      this.actionBarAction === 'email' &&
      !config.slideshow.emailRegex.test(this.actionTextInput.value)
    )
      return false;

    return true;
  }

  async formAction(e) {
    logger.log('Slideshow: formAction', e, this.actionBarAction);

    e.preventDefault();

    if (this.slideActionButton.classList.contains('success'))
      return;

    if (!this.formValid())
      return this.setInputErrorState();

    this.slideActionButton.innerHTML = '<i class="gg-loadbar-alt"></i>';

    try {
      const action = (this.actionBarAction === 'email') ? 'join' : 'access';
      const url = `${config.events.url}/${action}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'email': this.actionTextInput.value
        })
      });

      if (response.ok)
        return this.setInputSuccessState();
      else
        throw new Error(`Failed to get response (${response.status})`);
    } catch (error) {
      return this.setInputErrorState();
    }
  }

  actionTextInputChangeAction(e) {
    logger.log('Slideshow: actionTextInputChangeAction', e);

    this.resetInputState();
  }

  navAction(e) {
    logger.log('Slideshow: navAction', e);

    let navItem;

    if (e.target.classList.contains('nav-item'))
      navItem = e.target;
    else
      navItem = e.target.closest('.nav-item');

    // https://stackoverflow.com/questions/5913927/get-child-node-index
    // Need to wrap items
    const goToIndex = Array.from(this.navItemsWrapper.children).indexOf(navItem);

    if (goToIndex > -1) {
      this.index = -1;
      this.navigateSlideshow(goToIndex);
    }
  }

  nextPrevAction(e) {
    logger.log('Slideshow: nextPrevAction', e, this.slideIndex)

    let navItem, currentIndex = this.slideIndex;

    if (e.target.classList.contains('.gg-play-button'))
      navItem = e.target;
    else
      navItem = e.target.closest('.gg-play-button');

    if (navItem.classList.contains('disabled'))
      return;

    if (navItem.classList.contains('left'))
      currentIndex--
    else
      currentIndex++

    this.navigateSlideshow(currentIndex);
  }

  discordAction() {
    logger.log('Slideshow: discordAction');

    window.open(config.slideshow.discordLink, '_blank').focus();
  }

  navigateSlideshow(toIndex) {
    logger.log('Slideshow: navigateSlideshow', toIndex);

    this.slides.forEach((slide, index) => {

      slide.classList.add('slide-not-active');
      slide.classList.remove('slide-active');

      const navItem = this.navItems[index];
      navItem.classList.remove('nav-active');

      if (toIndex >= index)
        navItem.classList.add('nav-seen');

      //navItem.querySelector('.progress-bar__fill').style.width = 0;

      if ((index === toIndex) || (!toIndex && index === 0)) {
        this.slideIndex = index;

        this.setActiveSlide({ index })
        this.setActiveNav({ index })
      }
    });

    if (this.slideIndex === this.slides.length - 1) 
      this.rightIcon.classList.add('disabled');
    else 
      this.rightIcon.classList.remove('disabled');

    if (this.slideIndex === 0)
      this.leftIcon.classList.add('disabled');
    else
      this.leftIcon.classList.remove('disabled');
  }

  setActiveSlide({ index, slide }) {
    logger.log('Slideshow: setActiveSlide');

    this.currentSlide = slide || this.slides[index];
    this.currentSlide.classList.remove('slide-not-active');
    this.currentSlide.classList.add('slide-active');
  }

  setActiveNav({ index, navItem }) {
    logger.log('Slideshow: setActiveNav');

    this.currentNav = navItem || this.navItems[index];
    this.currentNav.classList.add('nav-active');
  }

  destroy() {
    logger.log('Slideshow: destroy');

    this.navWrapper.removeEventListener('click', this.bindNavAction);
    this.leftIcon.removeEventListener('click', this.bindNextPrevAction);
    this.rightIcon.removeEventListener('click', this.bindNextPrevAction);
    this.discordButton.removeEventListener('click', this.bindDiscordAction);
    this.actionBarForm.removeEventListener('submit', this.bindFormAction);
    this.actionTextInput.removeEventListener('keydown', this.bindActionTextInputChangeAction);
    this.keyNoteWrapper.removeEventListener('click', this.bindToggleActionBar);

    if (this.parent) 
      this.parent.removeChild(this.domElement);
  }
}