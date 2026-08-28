/* =========================================
   🚀 NOVADROP
   Telegram Mini App
   Spin + Token + USDT Demo
   TON Connect + Referral
========================================= */

const SUPABASE_URL =
  "https://amtabsacamnfzikwmfxr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_i-DXZ0D1j1kn1PxnCggsRA_TjWrDeuP";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================
   TELEGRAM
========================================= */

const tg =
  window.Telegram &&
  window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

if (tg) {
  tg.ready();
  tg.expand();
}

const telegramUser =
  tg &&
  tg.initDataUnsafe &&
  tg.initDataUnsafe.user
    ? tg.initDataUnsafe.user
    : null;


/* =========================================
   REFERRAL
========================================= */

const BOT_USERNAME = "NovaDropCoinBot";

function getStartParameter() {
  if (!tg) return null;

  return tg.initDataUnsafe.start_param || null;
}

function getReferralLink() {

  if (!telegramUser) return "";

  return (
    "https://t.me/" +
    BOT_USERNAME +
    "?start=" +
    encodeURIComponent(
      String(telegramUser.id)
    )
  );
}


/* =========================================
   DATA
========================================= */

const DEFAULT_DATA = {
  coins: 0,
  xp: 0,
  level: 1,

  streak: 0,
  lastStreakDate: null,

  completedTasks: [],
  purchases: [],

  walletAddress: null,

  referralCount: 0,
  referredBy: null,

  tokenBalance: 0,
  usdtBalance: 0,

  spinCount: 1,
  lastDailySpinDate: null,

  premium: false
};


let data;

try {

  const saved =
    localStorage.getItem(
      "novadrop_data"
    );

  data =
    saved
      ? JSON.parse(saved)
      : { ...DEFAULT_DATA };

} catch (error) {

  console.error(
    "Data loading error:",
    error
  );

  data = {
    ...DEFAULT_DATA
  };

}


/* =========================================
   REPAIR DATA
========================================= */

data.coins =
  Number(data.coins) || 0;

data.xp =
  Number(data.xp) || 0;

data.level =
  Number(data.level) || 1;

data.streak =
  Number(data.streak) || 0;

data.referralCount =
  Number(data.referralCount) || 0;

data.tokenBalance =
  Number(data.tokenBalance) || 0;

data.usdtBalance =
  Number(data.usdtBalance) || 0;

data.spinCount =
  Number(data.spinCount) || 0;


if (!Array.isArray(data.completedTasks)) {
  data.completedTasks = [];
}

if (!Array.isArray(data.purchases)) {
  data.purchases = [];
}


/* =========================================
   SAVE
========================================= */

function save() {

  localStorage.setItem(
    "novadrop_data",
    JSON.stringify(data)
  );

}


/* =========================================
   LEVEL
========================================= */

function calculateLevel(
  xp = data.xp
) {

  let level = 1;
  let remainingXP =
    Number(xp) || 0;

  let neededXP = 100;

  while (
    remainingXP >= neededXP
  ) {

    remainingXP -= neededXP;

    level++;

    neededXP =
      level * 100;
  }

  return {
    level,
    currentXP: remainingXP,
    neededXP
  };

}


/* =========================================
   FORMAT
========================================= */

function formatNumber(number) {

  return Number(number || 0)
    .toLocaleString("en-US");

}


/* =========================================
   UI
========================================= */

function updateUI() {

  const levelData =
    calculateLevel();

  data.level =
    levelData.level;


  const values = {

    coins:
      data.coins,

    xp:
      data.xp,

    level:
      data.level,

    streak:
      data.streak,

    walletCoins:
      data.coins,

    shopCoins:
      data.coins,

    referralCount:
      data.referralCount,

    spinCount:
      data.spinCount,

    tokenBalance:
      formatNumber(
        data.tokenBalance
      ),

    usdtBalance:
      data.usdtBalance.toFixed(2),

    profileToken:
      formatNumber(
        data.tokenBalance
      ),

    profileUSDT:
      data.usdtBalance.toFixed(2),

    profileLevel:
      data.level,

    profileStreak:
      data.streak,

    leaderXP:
      data.xp + " XP",

    xpText:
      levelData.currentXP +
      " / " +
      levelData.neededXP +
      " XP"
  };


  Object.keys(values)
    .forEach(id => {

      const element =
        document.getElementById(id);

      if (element) {

        element.textContent =
          values[id];

      }

    });


  const progress =
    document.getElementById(
      "levelProgress"
    );

  if (progress) {

    progress.style.width =
      Math.min(
        100,
        (
          levelData.currentXP /
          levelData.neededXP
        ) * 100
      ) + "%";

  }


  const referralLink =
    document.getElementById(
      "referralLink"
    );

  if (referralLink) {

    referralLink.value =
      getReferralLink();

  }


  const walletStatus =
    document.getElementById(
      "walletStatus"
    );

  const connectedWallet =
    document.getElementById(
      "connectedWallet"
    );


  if (data.walletAddress) {

    if (walletStatus) {

      walletStatus.textContent =
        "✅ Wallet Connected";

    }

    if (connectedWallet) {

      connectedWallet.textContent =
        shortenAddress(
          data.walletAddress
        );

    }

  } else {

    if (walletStatus) {

      walletStatus.textContent =
        "Wallet not connected";

    }

    if (connectedWallet) {

      connectedWallet.textContent =
        "—";

    }

  }


  const premiumStatus =
    document.getElementById(
      "premiumStatus"
    );

  const profilePremium =
    document.getElementById(
      "profilePremium"
    );


  if (data.premium) {

    if (premiumStatus) {
      premiumStatus.textContent =
        "⭐ Premium Active";
    }

    if (profilePremium) {
      profilePremium.textContent =
        "Yes";
    }

  } else {

    if (premiumStatus) {
      premiumStatus.textContent =
        "Premium inactive";
    }

    if (profilePremium) {
      profilePremium.textContent =
        "No";
    }

  }


  renderTasks();

  updateSpinButton();

  save();

}


/* =========================================
   TASKS
========================================= */

const TASKS = {

  channel: {
    title: "Join Channel",
    xp: 100,
    coins: 100
  },

  invite: {
    title: "Invite Friends",
    xp: 50,
    coins: 50
  },

  daily: {
    title: "Daily Check-in",
    xp: 10,
    coins: 10
  },

  wallet: {
    title: "Connect TON Wallet",
    xp: 100,
    coins: 100
  }

};


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

  Object.keys(TASKS)
    .forEach(taskId => {

      const element =
        document.getElementById(
          "task-" + taskId
        );

      if (!element) return;


      const button =
        element.querySelector(
          "button"
        );


      if (
        data.completedTasks
          .includes(taskId)
      ) {

        element.classList.add(
          "completed"
        );

        if (button) {

          button.textContent =
            "✓ Done";

          button.disabled =
            true;

        }

      }

    });

}


/* =========================================
   COMPLETE TASK
========================================= */

function completeTask(taskId) {

  const task =
    TASKS[taskId];

  if (!task) return;


  if (
    data.completedTasks
      .includes(taskId)
  ) {

    alert(
      "This task is already completed ✓"
    );

    return;
  }


  if (taskId === "invite") {

    shareReferral();

    return;
  }


  if (taskId === "channel") {

    window.open(
      "https://t.me/NovaDropOfficial",
      "_blank"
    );

  }


  if (taskId === "wallet") {

    if (!data.walletAddress) {

      alert(
        "Connect your TON Wallet first."
      );

      return;

    }

  }


  data.xp += task.xp;

  data.coins += task.coins;

  data.completedTasks.push(
    taskId
  );

  save();

  updateUI();

}


/* =========================================
   DAILY STREAK
========================================= */

function claimStreak() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  if (
    data.lastStreakDate ===
    today
  ) {

    alert(
      "Today's reward is already claimed 🔥"
    );

    return;

  }


  if (!data.lastStreakDate) {

    data.streak = 1;

  } else {

    const previous =
      new Date(
        data.lastStreakDate
      );

    const current =
      new Date(today);

    const difference =
      Math.floor(
        (
          current -
          previous
        ) / 86400000
      );


    if (difference === 1) {

      data.streak++;

    } else {

      data.streak = 1;

    }

  }


  data.lastStreakDate =
    today;


  const reward =
    Math.min(
      500,
      data.streak * 25
    );


  data.coins +=
    reward;


  save();

  updateUI();


  alert(
    "🔥 " +
    data.streak +
    " Day Streak!\n\n+" +
    reward +
    " Coins"
  );

}


/* =========================================
   🎡 DAILY SPIN
========================================= */

function prepareDailySpin() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  /*
   * First time:
   * Give one free spin.
   */

  if (
    data.lastDailySpinDate === null ||
    data.lastDailySpinDate === undefined
  ) {

    data.spinCount =
      Math.max(
        data.spinCount,
        1
      );

    data.lastDailySpinDate =
      today;

    save();

    return;
  }


  /*
   * New day:
   * Give one additional free spin.
   */

  if (
    data.lastDailySpinDate !==
    today
  ) {

    data.spinCount += 1;

    data.lastDailySpinDate =
      today;

    save();

  }

}


/* =========================================
   SPIN BUTTON
========================================= */

function updateSpinButton() {

  const button =
    document.getElementById(
      "spinButton"
    );

  if (!button) return;


  if (data.spinCount > 0) {

    button.disabled = false;

    button.textContent =
      "🎡 SPIN";

  } else {

    button.disabled = true;

    button.textContent =
      "No Spins";

  }

}


/* =========================================
   🎡 SPIN WHEEL
========================================= */

function spinWheel() {

  console.log(
    "🎡 Spin clicked"
  );


  /*
   * Make sure daily spin
   * has been prepared.
   */

  prepareDailySpin();


  if (
    Number(data.spinCount) <= 0
  ) {

    alert(
      "❌ No spins available.\n\n" +
      "Come back tomorrow or invite a friend."
    );

    return;

  }


  data.spinCount--;

  save();

  updateSpinButton();


  const rewards = [

    {
      name: "100 Token",
      type: "token",
      value: 100
    },

    {
      name: "250 Token",
      type: "token",
      value: 250
    },

    {
      name: "500 Token",
      type: "token",
      value: 500
    },

    {
      name: "1,000 Token",
      type: "token",
      value: 1000
    },

    {
      name: "0.10 USDT Demo",
      type: "usdt",
      value: 0.10
    },

    {
      name: "0.50 USDT Demo",
      type: "usdt",
      value: 0.50
    },

    {
      name: "1.00 USDT Demo",
      type: "usdt",
      value: 1.00
    },

    {
      name: "25 Coins",
      type: "coins",
      value: 25
    }

  ];


  const reward =
    rewards[
      Math.floor(
        Math.random() *
        rewards.length
      )
    ];


  const wheel =
    document.getElementById(
      "spinWheel"
    );


  if (wheel) {

    wheel.classList.remove(
      "spin-animation"
    );

    void wheel.offsetWidth;

    wheel.classList.add(
      "spin-animation"
    );

  }


  setTimeout(
    function () {

      applySpinReward(
        reward
      );

    },
    1800
  );

}


/* =========================================
   APPLY SPIN REWARD
========================================= */

function applySpinReward(
  reward
) {

  if (
    reward.type ===
    "token"
  ) {

    data.tokenBalance +=
      reward.value;

  }


  if (
    reward.type ===
    "usdt"
  ) {

    data.usdtBalance +=
      reward.value;

  }


  if (
    reward.type ===
    "coins"
  ) {

    data.coins +=
      reward.value;

  }


  const result =
    document.getElementById(
      "spinResult"
    );


  if (result) {

    result.textContent =
      "🎉 You won: " +
      reward.name;

  }


  save();

  updateUI();


  alert(
    "🎉 Congratulations!\n\n" +
    "You won " +
    reward.name
  );

}


/* =========================================
   REFERRAL COPY
========================================= */

function copyReferralLink() {

  const link =
    getReferralLink();


  if (!link) {

    alert(
      "Please open NovaDrop inside Telegram."
    );

    return;

  }


  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(link)
      .then(() => {

        alert(
          "✅ Referral link copied!"
        );

      })
      .catch(() => {

        fallbackCopy(link);

      });

  } else {

    fallbackCopy(link);

  }

}


function fallbackCopy(text) {

  const input =
    document.getElementById(
      "referralLink"
    );

  if (!input) return;

  input.focus();

  input.select();

  document.execCommand(
    "copy"
  );

  alert(
    "✅ Referral link copied!"
  );

}


/* =========================================
   SHARE REFERRAL
========================================= */

function shareReferral() {

  const link =
    getReferralLink();


  if (!link) {

    alert(
      "Please open NovaDrop inside Telegram."
    );

    return;

  }


  const text =
    "🚀 Join NovaDrop and earn Coins + XP!";


  const shareUrl =
    "https://t.me/share/url?url=" +
    encodeURIComponent(link) +
    "&text=" +
    encodeURIComponent(text);


  if (
    tg &&
    typeof tg.openTelegramLink ===
      "function"
  ) {

    tg.openTelegramLink(
      shareUrl
    );

  } else {

    window.open(
      shareUrl,
      "_blank"
    );

  }

}


/* =========================================
   PREMIUM DEMO
========================================= */

function activateDemoPremium() {

  data.premium = true;

  save();

  updateUI();


  alert(
    "⭐ Premium Demo activated!\n\n" +
    "Demo only — no TON payment was made."
  );

}


/* =========================================
   SHOP
========================================= */

function buyItem(
  name,
  price
) {

  if (
    data.coins < price
  ) {

    alert(
      "Not enough Coins 🪙"
    );

    return;

  }


  data.coins -=
    price;


  data.purchases.push({

    name,
    price,

    date:
      new Date()
        .toLocaleString()

  });


  save();

  updateUI();


  alert(
    name +
    " purchased successfully! 🛍️"
  );

}


/* =========================================
   TON CONNECT
========================================= */

let tonConnectUI = null;


function initTONConnect() {

  if (
    typeof TON_CONNECT_UI ===
    "undefined"
  ) {

    console.error(
      "TON Connect library not loaded."
    );

    return;

  }


  const button =
    document.getElementById(
      "ton-connect"
    );


  if (!button) return;


  try {

    tonConnectUI =
      new TON_CONNECT_UI.TonConnectUI({

        manifestUrl:
          window.location.origin +
          "/tonconnect-manifest.json",

        buttonRootId:
          "ton-connect"

      });


    tonConnectUI.onStatusChange(
      async wallet => {

        if (wallet) {

          await onWalletConnected(
            wallet
          );

        } else {

          onWalletDisconnected();

        }

      }
    );


  } catch (error) {

    console.error(
      "TON Connect error:",
      error
    );

  }

}


/* =========================================
   WALLET CONNECTED
========================================= */

async function onWalletConnected(
  wallet
) {

  const address =
    wallet &&
    wallet.account &&
    wallet.account.address
      ? wallet.account.address
      : null;


  if (!address) return;


  const wasConnected =
    data.walletAddress ===
    address;


  data.walletAddress =
    address;


  if (
    !wasConnected &&
    !data.completedTasks
      .includes("wallet")
  ) {

    data.xp += 100;

    data.coins += 100;

    data.completedTasks.push(
      "wallet"
    );


    alert(
      "💎 TON Wallet Connected!\n\n" +
      "+100 XP\n" +
      "+100 Coins"
    );

  }


  save();

  updateUI();

}


/* =========================================
   WALLET DISCONNECTED
========================================= */

function onWalletDisconnected() {

  data.walletAddress =
    null;

  save();

  updateUI();

}


/* =========================================
   ADDRESS
========================================= */

function shortenAddress(
  address
) {

  if (!address) return "";

  if (address.length <= 14) {
    return address;
  }

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-6)
  );

}


/* =========================================
   REFERRAL SERVER
========================================= */

async function processReferral() {

  if (
    !tg ||
    !tg.initData
  ) {

    return;

  }


  try {

    const startParam =
      getStartParameter();


    const response =
      await supabaseClient
        .functions
        .invoke(
          "process-referral",
          {

            body: {

              initData:
                tg.initData,

              startParam

            }

          }
        );


    const result =
      response.data;

    const error =
      response.error;


    if (error) {

      console.error(
        "Referral error:",
        error
      );

      return;

    }


    if (!result) return;


    if (result.profile) {

      const profile =
        result.profile;


      data.coins =
        Number(
          profile.coins
        ) || data.coins;


      data.xp =
        Number(
          profile.xp
        ) || data.xp;


      data.level =
        Number(
          profile.level
        ) || data.level;


      data.streak =
        Number(
          profile.streak
        ) || data.streak;


      data.referralCount =
        Number(
          profile.referral_count
        ) || data.referralCount;

    }


    /*
     * Every successful referral
     * gives one additional spin.
     */

    if (
      result.referralRewarded
    ) {

      data.spinCount += 1;

      alert(
        "🎉 Successful Referral!\n\n" +
        "+1 Spin"
      );

    }


    save();

    updateUI();


  } catch (error) {

    console.error(
      "Referral exception:",
      error
    );

  }

}


/* =========================================
   NAVIGATION
========================================= */

function scrollToTop() {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function scrollToWallet() {

  const wallet =
    document.querySelector(
      ".wallet-balance"
    );

  if (wallet) {

    wallet.closest(
      ".card"
    ).scrollIntoView({
      behavior: "smooth"
    });

  }

}


function scrollToSpin() {

  const spin =
    document.querySelector(
      ".spin-card"
    );

  if (spin) {

    spin.scrollIntoView({
      behavior: "smooth"
    });

  }

}


function scrollToPremium() {

  const premium =
    document.querySelector(
      ".premium-card"
    );

  if (premium) {

    premium.scrollIntoView({
      behavior: "smooth"
    });

  }

}


function scrollToProfile() {

  const cards =
    document.querySelectorAll(
      ".card"
    );

  const last =
    cards[
      cards.length - 1
    ];

  if (last) {

    last.scrollIntoView({
      behavior: "smooth"
    });

  }

}


/* =========================================
   RESET
========================================= */

function resetProgress() {

  const confirmed =
    confirm(
      "Reset all NovaDrop progress?"
    );


  if (!confirmed) return;


  data = {
    ...DEFAULT_DATA
  };


  /*
   * Give first free spin again.
   */

  data.spinCount = 1;


  save();

  updateUI();


  alert(
    "♻️ Progress reset successfully."
  );

}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log(
      "🚀 NovaDrop starting..."
    );


    /*
     * Prepare today's free spin.
     */

    prepareDailySpin();


    updateUI();


    initTONConnect();


    /*
     * Referral is optional.
     * If Supabase function fails,
     * the app continues working.
     */

    await processReferral();


    updateUI();


    console.log(
      "🚀 NovaDrop ready!"
    );

  }
);
