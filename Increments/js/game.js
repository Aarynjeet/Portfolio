/**
 * Author: Aarynjeet Gill & Shreyas Hegde
 * Date Created: 2026-02-23
 * Description: Game logic for the Basketball Clicker incremental game.
 *              Manages all state, DOM updates, upgrades, auto-clicker,
 *              rewards, and the help panel. Strictly separates model
 *              from view — state is stored in JS variables and rendered
 *              to the DOM via manipulation; values are never read back
 *              from innerHTML.
 */
window.addEventListener('load', function () {

  let resources = 0;
  let totalResourcesEarned = 0;
  let clickValue = 1;
  let totalUpgradesBought = 0;
  let autoClickerTimerId = null;
  let autoClickerLevel = 0;

  let betterShoesCount = 0;
  let shootingCoachCount = 0;
  let mvpTrainingCount = 0;
  let teamSpiritCount = 0;
  let ballBoyCount = 0;

  let rewardFirstBasket = false;
  let rewardRisingStar = false;
  let rewardAllStar = false;
  let rewardRookieContract = false;
  let rewardTeamPlayer = false;
  let rewardOnAutopilot = false;

  let congratsTimeoutId = null;

  const upgrades = [
    { id: 'betterShoes', name: 'Better Shoes', desc: '+1 click value', basePrice: 10, priceMultiplier: 1.5, type: 'click', value: 1 },
    { id: 'shootingCoach', name: 'Shooting Coach', desc: '+3 click value', basePrice: 50, priceMultiplier: 1.6, type: 'click', value: 3 },
    { id: 'mvpTraining', name: 'MVP Training', desc: '+10 click value', basePrice: 250, priceMultiplier: 1.8, type: 'click', value: 10 },
    { id: 'teamSpirit', name: 'Team Spirit', desc: '+5 click value', basePrice: 100, priceMultiplier: 1.5, type: 'click', value: 5 },
    { id: 'ballBoy', name: 'Ball Boy', desc: 'Auto-click (faster each level)', basePrice: 75, priceMultiplier: 2, type: 'auto', value: 0 }
  ];

  const rewards = [
    { id: 'firstBasket', name: 'First Basket', icon: '\u{1F3C0}', description: 'Score 100 points' },
    { id: 'risingStar', name: 'Rising Star', icon: '\u{2B50}', description: 'Score 1,000 points' },
    { id: 'allStar', name: 'All-Star', icon: '\u{1F31F}', description: 'Score 10,000 points' },
    { id: 'rookieContract', name: 'Rookie Contract', icon: '\u{1F4DD}', description: 'Buy first upgrade' },
    { id: 'teamPlayer', name: 'Team Player', icon: '\u{1F91D}', description: 'Buy 5 upgrades' },
    { id: 'onAutopilot', name: 'On Autopilot', icon: '\u{1F916}', description: 'Activate auto-clicker' }
  ];

  const basketballBtn = document.getElementById('basketball-btn');
  const clickValueDisplay = document.getElementById('click-value-display');
  const resourceCountEl = document.getElementById('resource-count');
  const clickValueStat = document.getElementById('click-value-stat');
  const totalUpgradesStat = document.getElementById('total-upgrades-stat');
  const totalEarnedStat = document.getElementById('total-earned-stat');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressLabel = document.getElementById('progress-label');
  const starDisplay = document.getElementById('star-display');
  const upgradeListEl = document.getElementById('upgrade-list');
  const rewardsListEl = document.getElementById('rewards-list');
  const congratsBanner = document.getElementById('congrats-banner');
  const congratsMessage = document.getElementById('congrats-message');
  const helpBtn = document.getElementById('help-btn');
  const helpPanel = document.getElementById('help-panel');
  const helpCloseBtn = document.getElementById('help-close-btn');

  function getUpgradePrice(upgrade, count) {
    return Math.round(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, count));
  }

  function getUpgradeCount(id) {
    switch (id) {
      case 'betterShoes': return betterShoesCount;
      case 'shootingCoach': return shootingCoachCount;
      case 'mvpTraining': return mvpTrainingCount;
      case 'teamSpirit': return teamSpiritCount;
      case 'ballBoy': return ballBoyCount;
      default: return 0;
    }
  }

  function incrementUpgradeCount(id) {
    switch (id) {
      case 'betterShoes': betterShoesCount++; break;
      case 'shootingCoach': shootingCoachCount++; break;
      case 'mvpTraining': mvpTrainingCount++; break;
      case 'teamSpirit': teamSpiritCount++; break;
      case 'ballBoy': ballBoyCount++; break;
    }
  }

  function getNextMilestone(earned) {
    const milestones = [100, 1000, 10000, 50000, 100000, 500000, 1000000];
    for (let i = 0; i < milestones.length; i++) {
      if (earned < milestones[i]) return milestones[i];
    }
    let m = 10000000;
    while (earned >= m) m *= 10;
    return m;
  }

  function getPrevMilestone(next) {
    const milestones = [0, 100, 1000, 10000, 50000, 100000, 500000, 1000000];
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (milestones[i] < next) return milestones[i];
    }
    return 0;
  }

  function getPowerTier(cv) {
    if (cv >= 50) return 5;
    if (cv >= 25) return 4;
    if (cv >= 10) return 3;
    if (cv >= 5) return 2;
    if (cv >= 2) return 1;
    return 0;
  }

  function formatNumber(n) {
    return n.toLocaleString();
  }

  function renderAll() {
    renderScoreboard();
    renderUpgradeButtons();
    renderRewards();
  }

  function renderScoreboard() {
    resourceCountEl.textContent = formatNumber(resources);
    clickValueDisplay.textContent = formatNumber(clickValue);
    clickValueStat.textContent = formatNumber(clickValue);
    totalUpgradesStat.textContent = formatNumber(totalUpgradesBought);
    totalEarnedStat.textContent = formatNumber(totalResourcesEarned);

    const nextMilestone = getNextMilestone(totalResourcesEarned);
    const prevMilestone = getPrevMilestone(nextMilestone);
    const range = nextMilestone - prevMilestone;
    const progress = range > 0 ? ((totalResourcesEarned - prevMilestone) / range) * 100 : 0;

    progressBarFill.style.width = Math.min(progress, 100) + '%';
    progressLabel.textContent = 'Next milestone: ' + formatNumber(nextMilestone);

    const tier = getPowerTier(clickValue);
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      starsHtml += i < tier ? '\u2B50' : '\u2606';
    }
    starDisplay.textContent = starsHtml;
  }

  function renderUpgradeButtons() {
    if (upgradeListEl.children.length === 0) {
      buildUpgradeCards();
    }

    upgrades.forEach(function (upgrade) {
      const count = getUpgradeCount(upgrade.id);
      const price = getUpgradePrice(upgrade, count);
      const priceEl = document.getElementById('price-' + upgrade.id);
      const btnEl = document.getElementById('btn-' + upgrade.id);

      priceEl.textContent = 'Cost: ' + formatNumber(price) + ' pts (owned: ' + count + ')';
      btnEl.disabled = resources < price;
    });
  }

  function buildUpgradeCards() {
    upgrades.forEach(function (upgrade) {
      const card = document.createElement('div');
      card.className = 'upgrade-card';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'upgrade-info';

      const nameEl = document.createElement('div');
      nameEl.className = 'upgrade-name';
      nameEl.textContent = upgrade.name;

      const descEl = document.createElement('div');
      descEl.className = 'upgrade-desc';
      descEl.textContent = upgrade.desc;

      const priceEl = document.createElement('div');
      priceEl.className = 'upgrade-price';
      priceEl.id = 'price-' + upgrade.id;

      infoDiv.appendChild(nameEl);
      infoDiv.appendChild(descEl);
      infoDiv.appendChild(priceEl);

      const buyBtn = document.createElement('button');
      buyBtn.className = 'upgrade-buy-btn';
      buyBtn.id = 'btn-' + upgrade.id;
      buyBtn.textContent = 'Buy';
      buyBtn.addEventListener('click', function () {
        purchaseUpgrade(upgrade);
      });

      card.appendChild(infoDiv);
      card.appendChild(buyBtn);
      upgradeListEl.appendChild(card);
    });
  }

  function renderRewards() {
    if (rewardsListEl.children.length === 0) {
      buildRewardSlots();
    }

    rewards.forEach(function (reward) {
      const slot = document.getElementById('reward-' + reward.id);
      const earned = isRewardEarned(reward.id);
      if (earned) {
        slot.classList.remove('locked');
        slot.classList.add('earned');
      }
    });
  }

  function buildRewardSlots() {
    rewards.forEach(function (reward) {
      const slot = document.createElement('div');
      slot.className = 'reward-slot locked';
      slot.id = 'reward-' + reward.id;

      const iconEl = document.createElement('div');
      iconEl.className = 'reward-icon';
      iconEl.textContent = reward.icon;

      const labelEl = document.createElement('div');
      labelEl.className = 'reward-label';
      labelEl.textContent = reward.name;

      slot.appendChild(iconEl);
      slot.appendChild(labelEl);
      rewardsListEl.appendChild(slot);
    });
  }

  function addResources(amount) {
    resources += amount;
    totalResourcesEarned += amount;
    renderAll();
    checkRewards();
  }

  function onBasketballClick() {
    addResources(clickValue);
  }

  function purchaseUpgrade(upgrade) {
    const count = getUpgradeCount(upgrade.id);
    const price = getUpgradePrice(upgrade, count);
    if (resources < price) return;

    resources -= price;
    incrementUpgradeCount(upgrade.id);
    totalUpgradesBought++;

    if (upgrade.type === 'click') {
      clickValue += upgrade.value;
    } else if (upgrade.type === 'auto') {
      autoClickerLevel++;
      startAutoClicker();
    }

    renderAll();
    checkRewards();
  }

  function startAutoClicker() {
    if (autoClickerTimerId !== null) {
      clearInterval(autoClickerTimerId);
      autoClickerTimerId = null;
    }

    const interval = Math.max(300, 3000 - (autoClickerLevel - 1) * 500);

    autoClickerTimerId = setInterval(function () {
      addResources(clickValue);
    }, interval);
  }

  function isRewardEarned(id) {
    switch (id) {
      case 'firstBasket': return rewardFirstBasket;
      case 'risingStar': return rewardRisingStar;
      case 'allStar': return rewardAllStar;
      case 'rookieContract': return rewardRookieContract;
      case 'teamPlayer': return rewardTeamPlayer;
      case 'onAutopilot': return rewardOnAutopilot;
      default: return false;
    }
  }

  function showCongrats(message) {
    if (congratsTimeoutId !== null) {
      clearTimeout(congratsTimeoutId);
    }

    congratsMessage.textContent = message;
    congratsBanner.classList.remove('hidden');

    congratsTimeoutId = setTimeout(function () {
      congratsBanner.classList.add('hidden');
      congratsTimeoutId = null;
    }, 4000);
  }

  function checkRewards() {
    if (!rewardFirstBasket && totalResourcesEarned >= 100) {
      rewardFirstBasket = true;
      showCongrats('\u{1F3C6} First Basket! You scored 100 points!');
    }

    if (!rewardRisingStar && totalResourcesEarned >= 1000) {
      rewardRisingStar = true;
      showCongrats('\u{2B50} Rising Star! You scored 1,000 points!');
    }

    if (!rewardAllStar && totalResourcesEarned >= 10000) {
      rewardAllStar = true;
      showCongrats('\u{1F31F} All-Star! You scored 10,000 points!');
    }

    if (!rewardRookieContract && totalUpgradesBought >= 1) {
      rewardRookieContract = true;
      showCongrats('\u{1F4DD} Rookie Contract! You bought your first upgrade!');
    }

    if (!rewardTeamPlayer && totalUpgradesBought >= 5) {
      rewardTeamPlayer = true;
      showCongrats('\u{1F91D} Team Player! You bought 5 upgrades!');
    }

    if (!rewardOnAutopilot && autoClickerLevel >= 1) {
      rewardOnAutopilot = true;
      showCongrats('\u{1F916} On Autopilot! Auto-clicker activated!');
    }

    renderRewards();
  }

  basketballBtn.addEventListener('click', onBasketballClick);

  helpBtn.addEventListener('click', function () {
    helpPanel.classList.toggle('hidden');
  });

  helpCloseBtn.addEventListener('click', function () {
    helpPanel.classList.add('hidden');
  });

  renderAll();
});