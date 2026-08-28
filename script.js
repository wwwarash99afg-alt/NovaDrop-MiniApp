/* =========================================
   🚀 NOVADROP
   Telegram Mini App
   Real Referral System
   TON Connect
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


console.log(
  "🚀 NovaDrop JavaScript loaded!"
);


if (telegramUser) {

  console.log(
    "Telegram User ID:",
    telegramUser.id
  );

  console.log(
    "Telegram Username:",
    telegramUser.username ||
    telegramUser.first_name ||
    "NovaPlayer"
  );

}


/* =========================================
   REFERRAL
========================================= */

const BOT_USERNAME =
  "NovaDropCoinBot";


function getStartParameter() {

  if (!tg) {
    return null;
  }

  return (
    tg.initDataUnsafe.start_param ||
    null
  );

}


function getReferralLink() {

  if (!telegramUser) {
    return "";
  }

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

  transactions: [],

  purchases: [],

  walletAddress: null,

  referralCount: 0,

  referredBy: null

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


if (
  !Array.isArray(
    data.completedTasks
  )
) {

  data.completedTasks = [];

}


if (
  !Array.isArray(
    data.transactions
  )
) {

  data.transactions = [];

}


if (
  !Array.isArray(
    data.purchases
  )
) {

  data.purchases = [];

}


if (
  typeof data.referralCount !==
  "number"
) {

  data.referralCount = 0;

}


/* =========================================
   SAVE LOCAL
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
    remainingXP >=
    neededXP
  ) {

    remainingXP -=
      neededXP;

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
   REFERRAL SERVER SYNC
========================================= */

async function processReferral() {

  if (
    !tg ||
    !tg.initData
  ) {

    console.log(
      "Telegram initData unavailable."
    );

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
        "Referral function error:",
        error
      );

      return;

    }


    if (!result) {
      return;
    }


    if (
      result.profile
    ) {

      const profile =
        result.profile;


      data.coins =
        Number(
          profile.coins
        ) || 0;


      data.xp =
        Number(
          profile.xp
        ) || 0;


      data.level =
        Number(
          profile.level
        ) || 1;


      data.streak =
        Number(
          profile.streak
        ) || 0;


      data.referralCount =
        Number(
          profile.referral_count
        ) || 0;


      data.referredBy =
        profile.referred_by_telegram_id ||
        null;

    }


    if (
      result.referralRewarded
    ) {

      /*
       * Reward was already applied
       * securely on the server.
       */

      data.transactions.unshift({

        type:
          "earn",

        amount:
          50,

        description:
          "Referral Reward",

        date:
          new Date()
            .toLocaleString()

      });


      alert(
        "🎉 Referral successful!\n\n" +
        "+50 XP\n" +
        "+50 Coins"
      );

    }


    save();

    updateUI();


  } catch (error) {

    console.error(
      "Referral error:",
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

    levelLabel:
      data.level,

    dailyStreak:
      data.streak,

    leaderXP:
      data.xp + " XP",

    profileLevel:
      data.level,

    profileStreak:
      data.streak,

    referralCount:
      data.referralCount,

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


  if (
    data.walletAddress
  ) {

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

  }


  renderTasks();

  renderTransactions();

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
   TASKS
========================================= */

const TASKS = {

  channel: {
    title:
      "Join Channel",
    xp: 100,
    coins: 100
  },

  invite: {
    title:
      "Invite Friends",
    xp: 50,
    coins: 50
  },

  daily: {
    title:
      "Daily Check-in",
    xp: 10,
    coins: 10
  },

  wallet: {
    title:
      "Connect TON Wallet",
    xp: 100,
    coins: 100
  }

};


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


      if (!element) {
        return;
      }


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

  const task =
    TASKS[taskId];


  if (!task) {
    return;
  }


  if (
    data.completedTasks
      .includes(taskId)
  ) {

    alert(
      "This task is already completed ✓"
    );

    return;

  }


  if (
    taskId === "invite"
  ) {

    shareReferral();

    return;

  }


  if (
    taskId === "channel"
  ) {

    window.open(
      "https://t.me/NovaDropOfficial",
      "_blank"
    );

  }


  if (
    taskId === "wallet"
  ) {

    if (
      !data.walletAddress
    ) {

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


  data.transactions.unshift({

    type:
      "earn",

    amount:
      task.coins,

    description:
      task.title,

    date:
      new Date()
        .toLocaleString()

  });


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


  if (
    !data.lastStreakDate
  ) {

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


    if (
      difference === 1
    ) {

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


  data.transactions.unshift({

    type:
      "earn",

    amount:
      reward,

    description:
      "Daily Streak Reward",

    date:
      new Date()
        .toLocaleString()

  });


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


  data.transactions.unshift({

    type:
      "spend",

    amount:
      price,

    description:
      "Shop: " +
      name,

    date:
      new Date()
        .toLocaleString()

  });


  updateUI();


  alert(
    name +
    " purchased successfully! 🛍️"
  );

}


/* =========================================
   TRANSACTIONS
========================================= */

function renderTransactions() {

  const container =
    document.getElementById(
      "transactions"
    );


  if (!container) {
    return;
  }


  if (
    !data.transactions.length
  ) {

    container.innerHTML =
      '<p style="color:#8f9aaa;">No transactions yet.</p>';

    return;

  }


  container.innerHTML =
    data.transactions
      .slice(0, 20)
      .map(transaction => {

        const sign =
          transaction.type ===
          "earn"
            ? "+"
            : "-";


        return `
          <div style="
            padding:10px 0;
            border-bottom:1px solid #202b3d;
          ">

            <strong>
              ${transaction.description}
            </strong>

            <span style="
              float:right;
              color:#00eaff;
            ">
              ${sign}${transaction.amount} 🪙
            </span>

            <small style="
              display:block;
              color:#8f9aaa;
              margin-top:4px;
            ">
              ${transaction.date}
            </small>

          </div>
        `;

      })
      .join("");

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


  if (!button) {
    return;
  }


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
    wallet.account &&
    wallet.account.address
      ? wallet.account.address
      : null;


  if (!address) {
    return;
  }


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


    data.transactions.unshift({

      type:
        "earn",

      amount:
        100,

      description:
        "Connect TON Wallet",

      date:
        new Date()
          .toLocaleString()

    });


    alert(
      "💎 TON Wallet Connected!\n\n" +
      "+100 XP\n" +
      "+100 Coins"
    );

  }


  updateUI();

}


/* =========================================
   WALLET DISCONNECTED
========================================= */

function onWalletDisconnected() {

  data.walletAddress =
    null;

  updateUI();

}


/* =========================================
   ADDRESS
========================================= */

function shortenAddress(
  address
) {

  if (!address) {
    return "";
  }


  if (
    address.length <= 14
  ) {

    return address;

  }


  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-6)
  );

}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    updateUI();

    initTONConnect();

    /*
     * This validates the Telegram user
     * and processes a referral.
     */

    await processReferral();

    updateUI();

    console.log(
      "🚀 NovaDrop ready!"
    );

  }
);
