/**
 * DATE INVITATION CARD - INTERACTIVE APPLICATION
 * Features: 3D Envelope, Playful Dodging No-Button, Multi-step Planner,
 * Boarding Pass Ticket, HTML2Canvas Export, Web Audio Synth, URL Sharing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STATE & CONFIGURATION
  // ==========================================
  const state = {
    senderName: 'Anh',
    recipientName: 'Em',
    invitationMessage: 'Thứ 5 ngày 15/10/2026 này, lúc 7h tối em có rảnh không? Anh muốn mời em một buổi date thật ngọt ngào: cùng đi ăn món em thích và dạo phố lộng gió với anh nhé! 🥰',
    currentStep: 1,
    soundEnabled: false,
    dodgeCount: 0,
    selectedDate: 'Thứ 5, 15/10/2026 🌟',
    selectedTime: '19:00 (7h tối) 🌃',
    selectedFoods: [
      'Lẩu ấm áp 🍲'
    ],
    selectedActivities: [
      'Dạo phố lộng gió cùng anh 🛵🍃'
    ],
    pickupMethod: 'Anh qua đón tận nơi 🛵',
    pickupLocation: '',
    dressCode: 'Tươi tắn, thoải mái nhất 👟',
    sweetNote: '',
    isLocked: false,
    passcode: '520'
  };

  // Phrases when recipient tries to click/hover "Hong đi đâu"
  const dodgePhrases = [
    'Hong cho từ chối đâu! 😝',
    'Ủa sao bấm nút này? 🥺',
    'Nút này bị kẹt rùi ó! 🏃‍♂️💨',
    'Bấm nút bên cạnh kìa! 👉',
    'Đi vớiiii, anh bao hết á! 💳✨',
    'Năn nỉ lun á nhaaa 🥺',
    'Chắc chắn là em bấm nhầm đúng hong? 💕',
    'Hong được thoát khỏi anh đâu! 🐻'
  ];

  // ==========================================
  // 2. DOM ELEMENTS
  // ==========================================
  // Scenes
  const sceneUnlock = document.getElementById('sceneUnlock');
  const sceneEnvelope = document.getElementById('sceneEnvelope');
  const sceneQuestion = document.getElementById('sceneQuestion');
  const scenePlanner = document.getElementById('scenePlanner');
  const sceneTicket = document.getElementById('sceneTicket');

  // Scene 0: Unlock elements
  const passcodeInput = document.getElementById('passcodeInput');
  const btnUnlockPasscode = document.getElementById('btnUnlockPasscode');
  const unlockTriggerQrBtn = document.getElementById('unlockTriggerQrBtn');

  // QR Studio elements
  const qrStudioModal = document.getElementById('qrStudioModal');
  const qrStudioTriggerBtn = document.getElementById('qrStudioTriggerBtn');
  const closeQrModalBtn = document.getElementById('closeQrModalBtn');
  const qrCodeContainer = document.getElementById('qrCodeContainer');
  const printableQrCard = document.getElementById('printableQrCard');
  const customQrUrlInput = document.getElementById('customQrUrlInput');
  const downloadQrCardBtn = document.getElementById('downloadQrCardBtn');
  const copyQrLinkBtn = document.getElementById('copyQrLinkBtn');
  const toggleLockScreenCb = document.getElementById('toggleLockScreenCb');

  // Envelope
  const envelopeCard = document.getElementById('envelopeCard');
  const openEnvelopeBtn = document.getElementById('openEnvelopeBtn');

  // Question & Buttons
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const btnNoText = document.getElementById('btnNoText');
  const currentDateDisplay = document.getElementById('currentDateDisplay');
  const invitationMessageDisplay = document.getElementById('invitationMessageDisplay');

  // Wizard (2 bước: Món ngon & Dặn dò)
  const wizardPanels = [
    document.getElementById('wizardStep1'),
    document.getElementById('wizardStep2')
  ];
  const progressSteps = document.querySelectorAll('.progress-step');
  const wizardPrevBtn = document.getElementById('wizardPrevBtn');
  const wizardNextBtn = document.getElementById('wizardNextBtn');
  const currentStepNum = document.getElementById('currentStepNum');

  // Wizard Form Fields
  const foodCheckboxes = document.querySelectorAll('input[name="foodItem"]');
  const customFoodInput = document.getElementById('customFoodInput');
  const pickupRadios = document.querySelectorAll('input[name="pickupMethod"]');
  const dressCodeRadios = document.querySelectorAll('input[name="dressCode"]');
  const sweetNoteInput = document.getElementById('sweetNoteInput');

  // Ticket Elements
  const ticketDateVal = document.getElementById('ticketDateVal');
  const ticketTimeVal = document.getElementById('ticketTimeVal');
  const ticketFoodVal = document.getElementById('ticketFoodVal');
  const ticketActivityVal = document.getElementById('ticketActivityVal');
  const ticketPickupVal = document.getElementById('ticketPickupVal');
  const ticketDressVal = document.getElementById('ticketDressVal');
  const ticketNoteVal = document.getElementById('ticketNoteVal');
  const ticketNoteWrapper = document.getElementById('ticketNoteWrapper');

  // Actions
  const downloadTicketBtn = document.getElementById('downloadTicketBtn');
  const shareZaloBtn = document.getElementById('shareZaloBtn');
  const copyDetailsBtn = document.getElementById('copyDetailsBtn');
  const planAgainBtn = document.getElementById('planAgainBtn');
  const toastMessage = document.getElementById('toastMessage');

  // Customizer Modal
  const customizerModal = document.getElementById('customizerModal');
  const customizerTriggerBtn = document.getElementById('customizerTriggerBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const customSenderName = document.getElementById('customSenderName');
  const customRecipientName = document.getElementById('customRecipientName');
  const customInvMessage = document.getElementById('customInvMessage');
  const shareableUrlInput = document.getElementById('shareableUrlInput');
  const copyShareableUrlBtn = document.getElementById('copyShareableUrlBtn');
  const saveCustomizerBtn = document.getElementById('saveCustomizerBtn');

  // Sound toggle
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  // ==========================================
  // 3. SOUND SYNTHESIZER (WEB AUDIO API)
  // No external audio files needed! Works offline reliably.
  // ==========================================
  let audioCtx = null;
  let bgmInterval = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.25, gainVal = 0.15) {
    if (!state.soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context may be restricted by browser policy
    }
  }

  function playChime() {
    if (!state.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 'sine', 0.4, 0.12), index * 100);
    });
  }

  function playPopSound() {
    if (!state.soundEnabled) return;
    playTone(700, 'triangle', 0.1, 0.2);
  }

  function playDodgeSound() {
    if (!state.soundEnabled) return;
    playTone(350, 'sine', 0.15, 0.15);
  }

  function startBgmLoop() {
    if (bgmInterval) clearInterval(bgmInterval);
    // Sweet lofi chord arpeggio notes
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66]  // G major
    ];
    let chordIndex = 0;
    
    bgmInterval = setInterval(() => {
      if (!state.soundEnabled) return;
      const currentChord = chords[chordIndex % chords.length];
      currentChord.forEach((freq, idx) => {
        setTimeout(() => {
          if (state.soundEnabled) playTone(freq, 'sine', 0.8, 0.04);
        }, idx * 300);
      });
      chordIndex++;
    }, 2400);
  }

  function stopBgmLoop() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }

  function toggleSound() {
    initAudioContext();
    state.soundEnabled = !state.soundEnabled;
    if (state.soundEnabled) {
      if (soundIcon) soundIcon.textContent = '🔊';
      if (soundToggleBtn) soundToggleBtn.classList.add('active');
      showToast('Đã bật giai điệu tình yêu 🎵');
      startBgmLoop();
      playChime();
    } else {
      if (soundIcon) soundIcon.textContent = '🎵';
      if (soundToggleBtn) soundToggleBtn.classList.remove('active');
      stopBgmLoop();
      showToast('Đã tắt âm thanh');
    }
  }

  // ==========================================
  // 4. FLOATING BACKGROUND ICONS (HANOI FOOD & ROMANCE)
  // ==========================================
  function createFloatingHearts() {
    const container = document.getElementById('heartsBg');
    if (!container) return;

    // Rich selection of cute date, Hanoi food, drinks, and romance icons
    const bgIcons = [
      '🍲', '🥩', '🍣', '🍷', '🍰', '🧋', '☕',
      '💖', '💕', '✨', '🌸', '💌', '🌷',
      '🐻', '🐰', '🥰', '🍓', '🥞', '🎀', '💫'
    ];

    function spawnIcon(customX, customY, isBurst = false) {
      if (isBurst) {
        const icon = document.createElement('span');
        icon.className = 'click-burst-icon';
        icon.textContent = bgIcons[Math.floor(Math.random() * bgIcons.length)];
        icon.style.left = `${customX}px`;
        icon.style.top = `${customY}px`;
        const dx = (Math.random() - 0.5) * 80;
        const rot = (Math.random() - 0.5) * 60;
        icon.style.setProperty('--dx', `${dx}px`);
        icon.style.setProperty('--rot', `${rot}deg`);
        document.body.appendChild(icon);
        setTimeout(() => icon.remove(), 950);
        return;
      }

      if (document.hidden) return; // Save resources when tab is in background

      const icon = document.createElement('span');
      icon.className = 'floating-bg-icon';
      icon.textContent = bgIcons[Math.floor(Math.random() * bgIcons.length)];

      const left = Math.random() * 92 + 4; // 4% to 96%
      const size = Math.random() * 16 + 18; // 18px to 34px
      const duration = Math.random() * 4 + 7; // 7s to 11s
      const animType = Math.random() > 0.5 ? 'floatUpSway1' : 'floatUpSway2';

      icon.style.left = `${left}vw`;
      icon.style.fontSize = `${size}px`;
      icon.style.animation = `${animType} ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`;

      container.appendChild(icon);

      setTimeout(() => {
        icon.remove();
      }, duration * 1000);
    }

    // Occasional scooter cruising across the background
    function spawnCruisingScooter() {
      if (document.hidden) return;
      const scooter = document.createElement('span');
      scooter.className = 'floating-scooter';
      scooter.textContent = '🛵💨';
      scooter.style.bottom = `${Math.random() * 12 + 6}vh`;
      container.appendChild(scooter);
      setTimeout(() => scooter.remove(), 14500);
    }

    // Initial batch spread out
    for (let i = 0; i < 12; i++) {
      setTimeout(() => spawnIcon(), i * 350);
    }

    // Continuous icon floating loop
    setInterval(() => {
      spawnIcon();
    }, 750);

    // Scooter drives across every 18 seconds
    setTimeout(spawnCruisingScooter, 3000);
    setInterval(spawnCruisingScooter, 18000);

    // Interactive: Click or Tap creates heart/icon burst at pointer position
    window.addEventListener('pointerdown', (e) => {
      if (e.target.closest('input, textarea, button, .selection-card, .radio-tag, .modal-card')) return;
      spawnIcon(e.clientX, e.clientY, true);
    }, { passive: true });
  }

  // ==========================================
  // 5. TOAST NOTIFICATION
  // ==========================================
  let toastTimer = null;
  function showToast(text, duration = 2800) {
    if (!toastMessage) return;
    toastMessage.textContent = text;
    toastMessage.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage.classList.remove('show');
    }, duration);
  }

  // ==========================================
  // 6. SCENE MANAGEMENT & NAVIGATION
  // ==========================================
  function switchScene(fromScene, toScene) {
    fromScene.classList.remove('active');
    setTimeout(() => {
      toScene.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }

  // ==========================================
  // 7. INITIALIZE PARAMS & DATES
  // ==========================================
  function setupDatesAndParams() {
    // Read from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const toParam = urlParams.get('to');
    const msgParam = urlParams.get('msg');
    const lockParam = urlParams.get('lock');

    if (fromParam) state.senderName = decodeURIComponent(fromParam);
    if (toParam) state.recipientName = decodeURIComponent(toParam);
    if (msgParam) state.invitationMessage = decodeURIComponent(msgParam);

    // Lock screen setup
    if (lockParam === '1') {
      state.isLocked = true;
      if (sceneEnvelope) sceneEnvelope.classList.remove('active');
      if (sceneUnlock) sceneUnlock.classList.add('active');
      if (toggleLockScreenCb) toggleLockScreenCb.checked = true;
    } else {
      state.isLocked = false;
      if (sceneEnvelope) sceneEnvelope.classList.add('active');
      if (sceneUnlock) sceneUnlock.classList.remove('active');
      if (toggleLockScreenCb) toggleLockScreenCb.checked = false;
    }

    updateNamesInDOM();

    // Format current date in letter
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    if (currentDateDisplay) {
      currentDateDisplay.textContent = today.toLocaleDateString('vi-VN', dateOptions);
    }

    state.selectedDate = 'Thứ 5, 15/10/2026 🌟';
    state.selectedTime = '19:00 (7h tối) 🌃';
  }

  function updateNamesInDOM() {
    document.querySelectorAll('.recipient-name-display').forEach(el => {
      el.textContent = state.recipientName;
    });
    document.querySelectorAll('.sender-name-display').forEach(el => {
      el.textContent = state.senderName;
    });
    if (invitationMessageDisplay) {
      invitationMessageDisplay.textContent = state.invitationMessage;
    }

    // Modal sync
    customSenderName.value = state.senderName;
    customRecipientName.value = state.recipientName;
    customInvMessage.value = state.invitationMessage;
    updateShareableUrl();
  }

  function updateShareableUrl() {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (state.senderName) params.set('from', state.senderName);
    if (state.recipientName) params.set('to', state.recipientName);
    if (state.invitationMessage) params.set('msg', state.invitationMessage);
    if (state.isLocked) params.set('lock', '1');
    
    shareableUrlInput.value = `${base}?${params.toString()}`;
    if (customQrUrlInput) {
      customQrUrlInput.value = shareableUrlInput.value;
    }
  }

  // ==========================================
  // 8. ENVELOPE OPENING
  // ==========================================
  function handleOpenEnvelope() {
    playPopSound();
    envelopeCard.classList.add('open');

    // Confetti burst
    if (window.confetti) {
      window.confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff6584', '#ff85a1', '#fbb1bd', '#ffd6e0']
      });
    }

    setTimeout(() => {
      playChime();
      switchScene(sceneEnvelope, sceneQuestion);
    }, 750);
  }

  openEnvelopeBtn.addEventListener('click', handleOpenEnvelope);
  envelopeCard.addEventListener('click', handleOpenEnvelope);

  // ==========================================
  // 9. THE PLAYFUL "HONG ĐI" EVASIVE BUTTON
  // ==========================================
  function dodgeNoButton() {
    playDodgeSound();
    state.dodgeCount++;

    // Random new text
    const randomPhrase = dodgePhrases[state.dodgeCount % dodgePhrases.length];
    btnNoText.textContent = randomPhrase;

    // Calculate boundary within container
    const card = sceneQuestion.querySelector('.letter-card');
    const cardRect = card.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Random displacement (-80 to 80px)
    const maxOffset = 70;
    const randomX = (Math.random() - 0.5) * maxOffset * 2;
    const randomY = (Math.random() - 0.5) * maxOffset * 1.5;

    btnNo.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.92)`;

    // Make the YES button grow larger & more inviting
    const yesScale = Math.min(1 + state.dodgeCount * 0.06, 1.35);
    btnYes.style.transform = `scale(${yesScale})`;
    btnYes.style.boxShadow = `0 10px ${24 + state.dodgeCount * 4}px rgba(255, 89, 123, 0.7)`;

    // Small vibration / feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  // On desktop hover or mobile touch
  btnNo.addEventListener('mouseenter', dodgeNoButton);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeNoButton();
  }, { passive: false });
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    dodgeNoButton();
  });

  // ==========================================
  // 10. "ĐỒNG Ý ĐI LIỀN!" BUTTON CLICK
  // ==========================================
  btnYes.addEventListener('click', () => {
    playChime();
    
    // Massive confetti burst
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ff4770', '#ff85a1', '#ffe066', '#a9def9', '#ff99c8']
      });
    }

    btnYes.innerHTML = '<span class="btn-emoji">💖</span><span>Yaaa tuyệt vời!</span>';

    setTimeout(() => {
      switchScene(sceneQuestion, scenePlanner);
      showToast('Bắt đầu lên lịch trình cho tụi mình nào! ✨');
    }, 600);
  });

  // ==========================================
  // 11. PLANNER WIZARD INTERACTIONS (2 BƯỚC: MÓN NGON & DẶN DÒ)
  // ==========================================

  // Food selection checkboxes
  foodCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      playPopSound();
      const parentCard = cb.closest('.selection-card');
      if (cb.checked) {
        parentCard.classList.add('selected');
      } else {
        parentCard.classList.remove('selected');
      }
    });
  });

  // Food category filter chips (All / Japanese / Thai)
  const foodFilterChips = document.querySelectorAll('[data-food-filter]');
  const foodCards = document.querySelectorAll('#foodGrid .selection-card');

  if (foodFilterChips.length > 0) {
    foodFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        playPopSound();
        foodFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.getAttribute('data-food-filter');
        foodCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Pickup radios
  pickupRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      playPopSound();
      document.querySelectorAll('input[name="pickupMethod"]').forEach(r => {
        r.closest('.radio-tag').classList.remove('active');
      });
      radio.closest('.radio-tag').classList.add('active');
      state.pickupMethod = e.target.value;
    });
  });

  // Dresscode radios
  dressCodeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      playPopSound();
      document.querySelectorAll('input[name="dressCode"]').forEach(r => {
        r.closest('.radio-tag').classList.remove('active');
      });
      radio.closest('.radio-tag').classList.add('active');
      state.dressCode = e.target.value;
    });
  });

  // Wizard Step Switching (2 Steps: 1 - Món ngon, 2 - Dặn dò)
  function goToStep(step) {
    state.currentStep = step;
    if (currentStepNum) currentStepNum.textContent = step;

    // Update panels
    wizardPanels.forEach((panel, index) => {
      if (panel) {
        if (index + 1 === step) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      }
    });

    // Update progress bar
    progressSteps.forEach((stepEl, index) => {
      const stepIdx = index + 1;
      if (stepIdx === step) {
        stepEl.classList.add('active');
        stepEl.classList.remove('completed');
      } else if (stepIdx < step) {
        stepEl.classList.remove('active');
        stepEl.classList.add('completed');
      } else {
        stepEl.classList.remove('active');
        stepEl.classList.remove('completed');
      }
    });

    // Toggle button texts & visibility
    if (wizardPrevBtn) wizardPrevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    
    if (wizardNextBtn) {
      if (step === 2) {
        wizardNextBtn.innerHTML = '<span>Hoàn tất & Xuất vé 🎟️</span>';
      } else {
        wizardNextBtn.innerHTML = '<span>Tiếp theo ›</span>';
      }
    }
  }

  // Wizard Next Button Click
  wizardNextBtn.addEventListener('click', () => {
    playPopSound();

    // Validation step 1 (Food)
    if (state.currentStep === 1) {
      const checkedFoods = Array.from(document.querySelectorAll('input[name="foodItem"]:checked')).map(i => i.value);
      if (checkedFoods.length === 0 && customFoodInput && !customFoodInput.value.trim()) {
        showToast('Chọn ít nhất một món ăn ngon nha em! 🍲');
        return;
      }
    }

    if (state.currentStep < 2) {
      goToStep(state.currentStep + 1);
    } else {
      // Finished both steps! Compile and show Ticket
      compileTicketData();
      switchScene(scenePlanner, sceneTicket);
      
      // Celebrate
      if (window.confetti) {
        window.confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.4 },
          colors: ['#ff4770', '#ffd166', '#06d6a0', '#118ab2', '#ff85a1']
        });
      }
      playChime();
    }
  });

  // Wizard Prev Button Click
  wizardPrevBtn.addEventListener('click', () => {
    playPopSound();
    if (state.currentStep > 1) {
      goToStep(state.currentStep - 1);
    }
  });

  // Clicking directly on progress indicators
  progressSteps.forEach(stepEl => {
    stepEl.addEventListener('click', () => {
      const targetStep = parseInt(stepEl.getAttribute('data-step'), 10);
      if (targetStep <= state.currentStep || targetStep === state.currentStep + 1) {
        goToStep(targetStep);
      }
    });
  });

  // ==========================================
  // 12. COMPILE TICKET DATA
  // ==========================================
  function compileTicketData() {
    // Collect foods
    const foods = Array.from(document.querySelectorAll('input[name="foodItem"]:checked')).map(i => i.value);
    if (customFoodInput && customFoodInput.value.trim()) {
      foods.push(customFoodInput.value.trim());
    }
    if (foods.length > 0) {
      state.selectedFoods = foods;
    }

    // Fixed date & time as requested
    state.selectedDate = 'Thứ 5, 15/10/2026 🌟';
    state.selectedTime = '19:00 (7h tối) 🌃';
    state.selectedActivities = ['Dạo phố lộng gió cùng anh 🛵🍃'];
    state.pickupLocation = '';

    // Sweet note
    if (sweetNoteInput) {
      state.sweetNote = sweetNoteInput.value.trim();
    }

    // Populate ticket UI
    ticketDateVal.textContent = state.selectedDate;
    ticketTimeVal.textContent = state.selectedTime;
    ticketFoodVal.textContent = state.selectedFoods.join(', ') || 'Lẩu ấm áp 🍲';
    ticketActivityVal.textContent = 'Dạo phố lộng gió cùng anh 🛵🍃';
    ticketPickupVal.textContent = state.pickupMethod || 'Anh qua đón tận nơi 🛵';
    ticketDressVal.textContent = state.dressCode || 'Thoải mái, năng động 👟';

    // Note
    if (state.sweetNote) {
      ticketNoteVal.textContent = `"${state.sweetNote}"`;
      ticketNoteWrapper.style.display = 'flex';
    } else {
      ticketNoteVal.textContent = '"Nụ cười của em là bắt buộc mang theo!"';
      ticketNoteWrapper.style.display = 'flex';
    }
  }

  // ==========================================
  // 13. TICKET ACTIONS (DOWNLOAD & SHARE)
  // ==========================================
  
  // 1. Download as Image with html2canvas
  downloadTicketBtn.addEventListener('click', () => {
    playPopSound();
    showToast('Đang tạo ảnh vé hẹn hò siêu nét... 📸');

    const ticketElement = document.getElementById('printableTicket');

    if (window.html2canvas) {
      window.html2canvas(ticketElement, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Ve_Hen_Ho_${state.recipientName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Đã lưu ảnh vé vào máy thành công! 💖');
      }).catch(err => {
        console.error(err);
        showToast('Lỗi khi chụp ảnh vé, bạn hãy chụp màn hình lại nhé!');
      });
    } else {
      showToast('Tính năng đang sẵn sàng, hãy chụp lại màn hình nha!');
    }
  });

  // Format sweet confirmation message
  function getFormattedTicketMessage() {
    return `💌 [XÁC NHẬN HẸN HÒ DATE PASS]\n` +
           `Gửi: ${state.recipientName} 💕\n` +
           `Từ: ${state.senderName} 🐻\n` +
           `--------------------------\n` +
           `🗓️ Ngày hẹn: ${ticketDateVal.textContent}\n` +
           `⏰ Giờ hẹn: ${ticketTimeVal.textContent}\n` +
           `🍲 Món ngon: ${ticketFoodVal.textContent}\n` +
           `🎡 Hoạt động: ${ticketActivityVal.textContent}\n` +
           `🛵 Đón đưa: ${ticketPickupVal.textContent}\n` +
           `👗 Dress code: ${ticketDressVal.textContent}\n` +
           (state.sweetNote ? `💬 Lời nhắn: "${state.sweetNote}"\n` : '') +
           `--------------------------\n` +
           `Tất cả chi phí và niềm vui anh lo trọn gói! Đừng trễ hẹn nha 🥰✨`;
  }

  // 2. Share via Web Share API or copy
  shareZaloBtn.addEventListener('click', async () => {
    playPopSound();
    const textMsg = getFormattedTicketMessage();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tấm Vé Hẹn Hò Dành Cho ${state.recipientName} 💖`,
          text: textMsg
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(textMsg, 'Đã copy lịch hẹn! Em dán gửi vào Zalo / Messenger nhé 💕');
      }
    } else {
      copyToClipboard(textMsg, 'Đã copy lịch hẹn! Em dán gửi vào Zalo / Messenger nhé 💕');
    }
  });

  // 3. Copy Details
  copyDetailsBtn.addEventListener('click', () => {
    playPopSound();
    const textMsg = getFormattedTicketMessage();
    copyToClipboard(textMsg, 'Đã sao chép tin nhắn xác nhận lịch hẹn vào khay nhớ tạm! 📋');
  });

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopyText(text, successMsg);
      });
    } else {
      fallbackCopyText(text, successMsg);
    }
  }

  function fallbackCopyText(text, successMsg) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(successMsg);
  }

  // 4. Plan Again (Change mind)
  planAgainBtn.addEventListener('click', () => {
    playPopSound();
    switchScene(sceneTicket, scenePlanner);
    goToStep(1);
  });

  // ==========================================
  // 14. CUSTOMIZER MODAL (FOR SENDER TO CUSTOMIZE)
  // ==========================================
  if (customizerTriggerBtn) {
    customizerTriggerBtn.addEventListener('click', () => {
      playPopSound();
      customizerModal.classList.add('active');
      updateShareableUrl();
    });
  }

  closeModalBtn.addEventListener('click', () => {
    playPopSound();
    customizerModal.classList.remove('active');
  });

  customizerModal.addEventListener('click', (e) => {
    if (e.target === customizerModal) {
      customizerModal.classList.remove('active');
    }
  });

  // Real-time link generator when inputs change
  [customSenderName, customRecipientName, customInvMessage].forEach(input => {
    input.addEventListener('input', () => {
      state.senderName = customSenderName.value.trim() || 'Anh';
      state.recipientName = customRecipientName.value.trim() || 'Em';
      state.invitationMessage = customInvMessage.value.trim();
      updateShareableUrl();
    });
  });

  // Copy shareable link button
  copyShareableUrlBtn.addEventListener('click', () => {
    playPopSound();
    copyToClipboard(shareableUrlInput.value, 'Đã copy link thiệp mời cá nhân hóa! 💌');
  });

  // Save & Apply
  saveCustomizerBtn.addEventListener('click', () => {
    playPopSound();
    state.senderName = customSenderName.value.trim() || 'Anh';
    state.recipientName = customRecipientName.value.trim() || 'Em';
    state.invitationMessage = customInvMessage.value.trim();

    updateNamesInDOM();
    customizerModal.classList.remove('active');
    showToast('Đã cập nhật thiệp mời cho hai đứa mình! ✨');
  });

  // ==========================================
  // 14B. QR CODE STUDIO & PASSCODE UNLOCK
  // ==========================================
  let qrCodeInstance = null;

  function renderQrCode(urlToEncode) {
    if (!qrCodeContainer) return;
    qrCodeContainer.innerHTML = '';

    const targetUrl = urlToEncode || shareableUrlInput.value || window.location.href;

    try {
      if (window.QRCode) {
        qrCodeInstance = new QRCode(qrCodeContainer, {
          text: targetUrl,
          width: 170,
          height: 170,
          colorDark: '#2b2327',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } else {
        // High quality fallback image QR code
        const encoded = encodeURIComponent(targetUrl);
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&color=2b2327`;
        img.alt = 'QR Code Thiệp Mời';
        img.style.width = '170px';
        img.style.height = '170px';
        qrCodeContainer.appendChild(img);
      }
    } catch (e) {
      console.warn('QR Render fallback', e);
    }
  }

  function openQrStudio() {
    playPopSound();
    updateShareableUrl();
    if (customQrUrlInput) {
      customQrUrlInput.value = shareableUrlInput.value;
    }
    renderQrCode(customQrUrlInput ? customQrUrlInput.value : shareableUrlInput.value);
    if (qrStudioModal) qrStudioModal.classList.add('active');
  }

  function closeQrStudio() {
    playPopSound();
    if (qrStudioModal) qrStudioModal.classList.remove('active');
  }

  if (qrStudioTriggerBtn) {
    qrStudioTriggerBtn.addEventListener('click', openQrStudio);
  }
  if (closeQrModalBtn) {
    closeQrModalBtn.addEventListener('click', closeQrStudio);
  }
  if (qrStudioModal) {
    qrStudioModal.addEventListener('click', (e) => {
      if (e.target === qrStudioModal) closeQrStudio();
    });
  }

  if (customQrUrlInput) {
    customQrUrlInput.addEventListener('input', () => {
      renderQrCode(customQrUrlInput.value.trim());
    });
  }

  if (downloadQrCardBtn) {
    downloadQrCardBtn.addEventListener('click', () => {
      playPopSound();
      showToast('Đang xuất ảnh Thẻ Mã QR sắc nét... 📸');

      if (window.html2canvas && printableQrCard) {
        window.html2canvas(printableQrCard, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff'
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = `The_Ma_QR_Moi_Date_${state.recipientName.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          showToast('Đã tải ảnh Thẻ Mã QR về máy thành công! 💖');
        }).catch(err => {
          console.error(err);
          showToast('Lỗi tải ảnh, bạn hãy chụp màn hình lại nhé!');
        });
      } else {
        showToast('Hãy chụp lại màn hình tấm thẻ QR này nha!');
      }
    });
  }

  if (copyQrLinkBtn) {
    copyQrLinkBtn.addEventListener('click', () => {
      playPopSound();
      const urlToCopy = customQrUrlInput ? customQrUrlInput.value : shareableUrlInput.value;
      copyToClipboard(urlToCopy, 'Đã sao chép link quét thiệp mời! 💌');
    });
  }

  // Toggle lock screen checkbox
  if (toggleLockScreenCb) {
    toggleLockScreenCb.addEventListener('change', () => {
      state.isLocked = toggleLockScreenCb.checked;
      updateShareableUrl();
    });
  }

  // Passcode Unlock Function
  function handleUnlockPasscode() {
    playPopSound();
    if (window.confetti) {
      window.confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ff4770', '#ff85a1', '#ffe066']
      });
    }
    playChime();
    showToast('Mở khóa thành công! Chào mừng em 💕');
    switchScene(sceneUnlock, sceneEnvelope);
  }

  if (btnUnlockPasscode) {
    btnUnlockPasscode.addEventListener('click', handleUnlockPasscode);
  }
  if (passcodeInput) {
    passcodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUnlockPasscode();
    });
  }
  if (unlockTriggerQrBtn) {
    unlockTriggerQrBtn.addEventListener('click', openQrStudio);
  }

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', toggleSound);
  }

  // ==========================================
  // 15. INITIALIZE APP
  // ==========================================
  setupDatesAndParams();
  createFloatingHearts();
});
