/* =========================================
   🚀 NOVADROP
   Telegram Mini App
   Referral + TON Connect + Lucky Spin
========================================= */

const SUPABASE_URL =
  "https://amtabsacamnfzikwmfxr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_i-DXZ0D1j1kn1PxnCggsRA_TjWRDeuP";

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

  return (
    tg.initDataUnsafe.start_param ||
    null
  );
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

  usdt: 0,

  xp: 0,

  level: 1,

  streak: 0,

  lastStreakDate: null,

  completedTasks: [],

  purchases: [],

  walletAddress: null,

  referralCount: 0,

  referredBy: null,

  spins: 1,

  lastDailySpin: null,

  premium: false

};


let data;

try {

  data =
    JSON.parse(
      localStorage.getItem(
        "novadrop_data"
      )
    ) ||
    {
      ...DEFAULT_DATA
    };

} catch {

  data = {
    ...DEFAULT_DATA
  };

}


/* =========================================
   DATA MIGRATION
========================================= */

if (!Array.isArray(data.completedTasks)) {
  data.completedTasks = [];
}

if (!Array.isArray(data.purchases)) {
  data.purchases = [];
}

if (typeof data.coins !== "number") {
  data.coins = 0;
}

if (typeof data.usdt !== "number") {
  data.usdt = 0;
}

if (typeof data.xp !== "number") {
  data.xp = 0;
}

if (typeof data.referralCount !== "number") {
  data.referralCount = 0;
}

if (typeof data.spins !== "number") {
  data.spins = 1;
}

if (typeof data.premium !== "boolean") {
  data.premium = false;
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

    currentXP:
      remainingXP,

    neededXP

  };

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
   REFERRAL SERVER
========================================= */

async function processReferral() {

  if (!tg || !tg.initData) {
    return;
  }

  try {

    const startParam =
      getStartParameter();

    const {
      data: result,
      error
    } =
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
        Number(profile.coins) || 0;

      data.xp =
        Number(profile.xp) || 0;

      data.level =
        Number(profile.level) || 1;

      data.streak =
        Number(profile.streak) || 0;

      data.referralCount =
        Number(
          profile.referral_count
        ) || 0;

      data.referredBy =
        profile.referred_by_telegram_id ||
        null;
    }


    /*
     * Successful referral:
     * give one extra spin.
     */

    if (result.referralRewarded) {

      data.spins += 1;

      alert(
        "🎉 Referral successful!\n\n" +
        "+1 Lucky Spin"
      );

    }

    save();

    updateUI();

  } catch (error) {

    console.error(
      "Referral processing error:",
      error
    );

  }

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

    usdtBalance:
      data.usdt.toFixed(2),

    xp:
      data.xp,

    level:
      data.level,

    levelLabel:
      data.level,

    streak:
      data.streak,

    walletCoins:
      data.coins,

    walletUSDT:
      data.usdt.toFixed(2),

    shopCoins:
      data.coins,

    leaderXP:
      data.xp + " XP",

    profileLevel:
      data.level,

    profileStreak:
      data.streak,

    profileCoins:
      data.coins,

    profileUSDT:
      data.usdt.toFixed(2),

    referralCount:
      data.referralCount,

    spinCount:
      data.spins,

    spinCoins:
      data.coins,

    spinUSDT:
      data.usdt.toFixed(2),

    referralSpins:
      data.spins,

    xpText:
      levelData.currentXP +
      " / " +
      levelData.neededXP +
      " XP",

    profilePremium:
      data.premium
        ? "Yes"
        : "No"

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

  if (premiumStatus) {

    premiumStatus.textContent =
      data.premium
        ? "⭐ Premium Active"
        : "Premium inactive";

  }


  renderTasks();

  save();

}


/* =========================================
   COPY REFERRAL
========================================= */

async function copyReferralLink() {

  const link =
    getReferralLink();

  if (!link) {

    alert(
      "Please open NovaDrop inside Telegram."
    );

    return;
  }

  try {

    await navigator.clipboard
      .writeText(link);

    alert(
      "✅ Referral link copied!"
    );

  } catch {

    const input =
      document.getElementById(
        "referralLink"
      );

    if (input) {

      input.focus();

      input.select();

      document.execCommand(
        "copy"
      );

      alert(
        "✅ Referral link copied!"
      );

    }

  }

}


/* =========================================
   SHARE
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
    "🚀 Join NovaDrop and earn Nova Tokens + Lucky Spins!";

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
   TASK RENDER
========================================= */

function renderTasks() {

  Object.keys(TASKS)
    .forEach(taskId => {

      const element =
        document.getElementById(
          "task-" +
          taskId
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

function completeTask(
  taskId
) {

  if (taskId === "invite") {

    shareReferral();

    return;
  }


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


  data.xp +=
    task.xp;

  data.coins +=
    task.coins;


  data.completedTasks.push(
    taskId
  );


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


  updateUI();


  alert(
    "🔥 " +
    data.streak +
    " Day Streak!\n\n+" +
    reward +
    " Nova"
  );

}


/* =========================================
   🎡 LUCKY SPIN
========================================= */

const SPIN_REWARDS = [

  {
    type: "coins",
    amount: 10,
    text: "🪙 +10 Nova"
  },

  {
    type: "coins",
    amount: 25,
    text: "🪙 +25 Nova"
  },

  {
    type: "coins",
    amount: 50,
    text: "🪙 +50 Nova"
  },

  {
    type: "coins",
    amount: 100,
    text: "🪙 +100 Nova"
  },

  {
    type: "usdt",
    amount: 0.01,
    text: "💵 +0.01 US
