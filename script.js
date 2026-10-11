const screens = {
  invitation: document.getElementById('invitation-screen'),
  'date-selection': document.getElementById('date-screen'),
  'activity-selection': document.getElementById('activity-screen'),
  confirmation: document.getElementById('confirmation-screen')
};

const bearShell = document.getElementById('bear-shell');
const confirmationBear = document.getElementById('confirmation-bear');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');
const bubbleEmoji = document.querySelector('.bubble-emoji');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const buttonStage = document.getElementById('button-stage');
const dateInput = document.getElementById('date-input');
const continueBtn = document.getElementById('continue-btn');
const confirmActivityBtn = document.getElementById('confirm-activity-btn');
const startAgainBtn = document.getElementById('start-again-btn');
const activityCards = [...document.querySelectorAll('.activity-card')];
const finalDateText = document.getElementById('final-date');
const finalActivityText = document.getElementById('final-activity');
const finalActivityImage = document.getElementById('final-activity-image');

const WHATSAPP_NUMBER = '256783465654';
const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');

const activityMeta = {
  'ice-cream': {
    label: 'Ice Cream 🍦',
    image: 'assets/ice-cream.png'
  },
  coffee: {
    label: 'Coffee ☕',
    image: 'assets/coffee.png'
  },
  pork: {
    label: 'Pork 🍖',
    image: 'assets/pork.png'
  },
  fish: {
    label: 'Fish 🐟',
    image: 'assets/fish.png'
  },
  chicken: {
    label: 'Chicken 🍗',
    image: 'assets/chicken.png'
  },
  movies: {
    label: 'Movies 🎬',
    image: 'assets/movies.png'
  },
  swimming: {
    label: 'Swimming 🏊',
    image: 'assets/swimming.png'
  }
};

const state = {
  screen: 'invitation',
  bearState: 'hopeful',
  selectedDate: '',
  selectedActivity: '',
  noButtonMoved: false
};

const BEAR_MARKUP = `
  <div class="bear-pose-stack state-hopeful">
    <img class="bear-pose pose-hopeful" src="assets/bear-hopeful.png" alt="Smiling teddy bear" draggable="false" />
    <img class="bear-pose pose-crying" src="assets/bear-crying.png" alt="Crying teddy bear" draggable="false" />
    <img class="bear-pose pose-happy" src="assets/bear-roses.png" alt="Teddy bear holding roses" draggable="false" />
    <div class="bear-tears" aria-hidden="true"><span>💧</span><span>💧</span></div>
    <div class="bear-hearts" aria-hidden="true"><span>💖</span><span>💗</span><span>💕</span></div>
  </div>`;

function setStackState(shell, stateName) {
  const stack = shell && shell.querySelector('.bear-pose-stack');
  if (!stack) return;
  stack.classList.remove('state-hopeful', 'state-crying', 'state-happy');
  stack.classList.add(`state-${stateName}`);
}

function loadBear() {
  bearShell.innerHTML = BEAR_MARKUP;
  confirmationBear.innerHTML = BEAR_MARKUP;
  applyBearState();
}

function applyBearState() {
  setStackState(bearShell, state.bearState);
  setStackState(confirmationBear, 'happy');
}

function setScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle('active', key === name);
  });

  state.screen = name;

  if (name !== 'invitation') {
    speechBubble.classList.remove('show');
  }
}

function setSpeech(message, emoji = '') {
  speechText.textContent = message;
  bubbleEmoji.textContent = emoji;
  speechBubble.classList.toggle('show', Boolean(message));
}

function getMinDateString() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const offset = tomorrow.getTimezoneOffset() * 60000;
  return new Date(tomorrow.getTime() - offset).toISOString().slice(0, 10);
}

function isFutureDate(dateString) {
  if (!dateString) return false;
  const chosenDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return chosenDate > today;
}

function moveNoButton(force = false) {
  if (state.screen !== 'invitation') return;

  const rect = buttonStage.getBoundingClientRect();
  const width = noBtn.offsetWidth || 150;
  const height = noBtn.offsetHeight || 54;

  const yesRect = yesBtn.getBoundingClientRect();
  const safeLeft = Math.max(18, rect.width * 0.58);
  const safeRight = Math.max(safeLeft + 24, rect.width - width - 18);
  const safeTop = 14;
  const safeBottom = Math.max(safeTop + 18, rect.height - height - 12);

  let x = Math.min(
    Math.max(safeLeft, (Math.random() * (safeRight - safeLeft)) + safeLeft),
    safeRight
  );

  if (yesRect.left > 0 && yesRect.right > 0) {
    const yesCenterX = yesRect.left + yesRect.width / 2;
    const noCenterX = x + width / 2;
    if (Math.abs(yesCenterX - noCenterX) < width + 20) {
      x = Math.max(safeLeft + 16, rect.width - width - 24);
    }
  }

  const y = Math.min(
    Math.max(safeTop, (Math.random() * (safeBottom - safeTop)) + safeTop),
    safeBottom
  );

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  state.noButtonMoved = true;

  if (force) {
    noBtn.setAttribute('data-forced', 'true');
  }
}

const NO_MESSAGES = [
  "Every time you say no, my heart skips a beat... I just want one beautiful moment with you, Grace.",
  "I'm not asking for much, my love, only a little of your time. You are my favourite part of every day.",
  "Even when you say no, I'd still choose you. Please give me a chance to make you smile?",
  "My heart is tiny, but all of it belongs to you, Grace. Won't you say yes?"
];
let noMessageIndex = 0;
let yesTimer = null;
const YES_BEAR_DURATION = 5000;

function triggerNoDodge() {
  if (state.screen !== 'invitation') return;
  moveNoButton(true);
  state.bearState = 'crying';
  applyBearState();
  const line = NO_MESSAGES[noMessageIndex % NO_MESSAGES.length];
  noMessageIndex += 1;
  setSpeech(line, '🥺 💔 💕');
}

function handleYesButton() {
  if (state.screen !== 'invitation') return;

  state.bearState = 'happy';
  applyBearState();
  setSpeech('You said yes! You just made my whole heart bloom, Grace. I promise to make this day unforgettable for you.', '🌹 💖 🥰');

  yesBtn.style.display = 'none';
  noBtn.style.display = 'none';

  clearTimeout(yesTimer);
  yesTimer = setTimeout(() => {
    setScreen('date-selection');
    dateInput.focus();
  }, YES_BEAR_DURATION);
}

function renderDateSelectionState() {
  dateInput.min = getMinDateString();
  dateInput.value = '';
  continueBtn.disabled = true;
  state.selectedDate = '';
}

function updateActivitySelection() {
  const selectedCard = activityCards.find((card) => card.classList.contains('selected'));
  confirmActivityBtn.disabled = !selectedCard;
}

function renderConfirmation() {
  const date = new Date(`${state.selectedDate}T00:00:00`);
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  finalDateText.textContent = formattedDate;
  finalActivityText.textContent = activityMeta[state.selectedActivity].label;
  const waText = [
    "Hi! It's Grace 💖",
    "I said YES to our date! 🥰",
    `📅 Date: ${formattedDate}`,
    `🍽️ Plan: ${activityMeta[state.selectedActivity].label}`,
    "Can't wait to see you, my love! 💕"
  ].join('\n');
  sendWhatsappBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  finalActivityImage.src = activityMeta[state.selectedActivity].image;
  finalActivityImage.alt = `${activityMeta[state.selectedActivity].label} illustration`;
}

function resetExperience() {
  clearTimeout(yesTimer);
  noMessageIndex = 0;
  state.screen = 'invitation';
  state.bearState = 'hopeful';
  state.selectedDate = '';
  state.selectedActivity = '';

  dateInput.value = '';
  dateInput.min = getMinDateString();
  continueBtn.disabled = true;

  activityCards.forEach((card) => {
    card.classList.remove('selected');
    card.setAttribute('aria-pressed', 'false');
  });
  confirmActivityBtn.disabled = true;

  yesBtn.style.display = 'inline-flex';
  noBtn.style.display = 'inline-flex';
  noBtn.style.left = '62%';
  noBtn.style.top = '72px';

  setSpeech('');
  setScreen('invitation');
  applyBearState();
  requestAnimationFrame(() => {
    if (state.screen === 'invitation') {
      moveNoButton(true);
    }
  });
}

function bindEvents() {
  yesBtn.addEventListener('click', handleYesButton);

  noBtn.addEventListener('pointerenter', triggerNoDodge);
  noBtn.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') {
      event.preventDefault();
      triggerNoDodge();
    }
  });
  noBtn.addEventListener('touchstart', (event) => {
    event.preventDefault();
    triggerNoDodge();
  }, { passive: false });
  noBtn.addEventListener('click', (event) => {
    event.preventDefault();
    triggerNoDodge();
  });

  dateInput.addEventListener('input', () => {
    const valid = isFutureDate(dateInput.value);
    continueBtn.disabled = !valid;
    if (valid) {
      state.selectedDate = dateInput.value;
    } else {
      state.selectedDate = '';
    }
  });

  continueBtn.addEventListener('click', () => {
    if (!state.selectedDate) return;
    setScreen('activity-selection');
  });

  activityCards.forEach((card) => {
    card.addEventListener('click', () => {
      const currentActivity = card.dataset.activity;

      activityCards.forEach((item) => {
        const selected = item === card;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      state.selectedActivity = currentActivity;
      updateActivitySelection();
    });
  });

  confirmActivityBtn.addEventListener('click', () => {
    if (!state.selectedActivity || !state.selectedDate) return;
    setScreen('confirmation');
    renderConfirmation();
  });

  startAgainBtn.addEventListener('click', resetExperience);

  window.addEventListener('resize', () => {
    if (state.screen === 'invitation' && !state.noButtonMoved) {
      moveNoButton(true);
    }
  });
}

(async function init() {
  bindEvents();
  loadBear();
  renderDateSelectionState();
  setSpeech('');
  setScreen('invitation');
  noBtn.style.left = '62%';
  noBtn.style.top = '72px';
  moveNoButton(true);
})();
